from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response

from django.core.exceptions import ObjectDoesNotExist
from django.utils.crypto import get_random_string

from api.models import User, School, Course, Assignment, Submission
from api.serializers import UserSerializer, SchoolSerializer, CourseSerializer, \
    AssignmentSerializer, SubmissionSerializer

from datetime import datetime, timedelta, timezone
import jwt, re
import passlib.hash as pl_hash

jwt_key = "N2bw4HUjrmcR"


def create_error_response(message):
    """
    Helper function to create an error response in a standard format
    :param message: Error message
    :return: Response
    """
    content = {'error_msg': message}
    return Response(content)


def generate_access_codes(course):
    """
    Helper function to set the student and ta access codes to a new random value.
    Access code is student/ta, the course id, then a random string.
    This way, duplicate access codes aren't an issue.
    :param course: course to set access codes
    """
    course.student_ac = 'student-' + str(course.id) + '-' + get_random_string(length=8)
    course.ta_ac = 'ta-' + str(course.id) + '-' + get_random_string(length=8)


# Routes from /user/
class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @detail_route()
    def assignments_due_week(self, request, pk=None):
        """
        Returns all the assignments due in the next week for the user
        :param request: GET request
        :param pk: primary key of user
        :return: Response of all assignments
        """
        days_after = 7
        now = datetime.now(timezone.utc)
        threshold = now + timedelta(days=days_after)
        user = self.get_object()
        # all the courses the user is a student of
        courses = user.students.all()
        # all the assignments
        assignments = [course.assignment_set.all() for course in courses]
        tr = []
        for assignment_set in assignments:
            for assignment in assignment_set:
                if now < assignment.end_date < threshold:
                    tr.append(assignment)
        serializer = AssignmentSerializer(tr, many=True)
        return Response(serializer.data)

    @detail_route()
    def get_course(self, request, pk=None):
        """
        Get list of courses of a user with the pk
        :param request: GET request
        :param pk: primary key of user
        :return: Courses that user is a student, ta, or instructor of
        """
        user = self.get_object()

        response = {
            'student': CourseSerializer(user.students.all(), many=True).data,
            'ta': CourseSerializer(user.tas.all(), many=True).data,
            'instructor': CourseSerializer(user.instructors.all(), many=True).data,
        }
        return Response(response)

    @list_route(methods=['post'])
    def authenticate(self, request):
        """
        Authenticate user and send a token if a login is successful.
        :param request: POST request with email and password
        :return: return error messages no user or password.
        Otherwise, return user's first_name, color, and generated access token.
        """
        email = request.data['email']
        password = request.data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return create_error_response('No such user')

        valid = pl_hash.django_pbkdf2_sha256.verify(password, user.password_hash)
        if not valid:
            return create_error_response('Invalid password')

        response = {
            'first_name': user.first_name,
            'color': user.color_pref,
            'token': jwt.encode({'id': user.id, 'email': email}, jwt_key)
        }
        return Response(response)

    @list_route(methods=['post'])
    def encode_token(self, request):
        """
        :param request: POST request with data to encode
        :return: jwt encoded token
        """
        payload = request.data
        body = {'token': jwt.encode(payload, jwt_key)}
        return Response(body)

    @list_route(methods=['post'])
    def decode_token(self, request):
        """
        :param request: POST request with 'token'
        :return: return error message or decoded token
        """
        token = request.data['token']
        try:
            body = jwt.decode(token, jwt_key)
            return Response(body)
        except jwt.DecodeError:
            return create_error_response('invalid token')

    def create(self, request, *args, **kwargs):
        """
        Override create method to hash the user's password
        :param request: POST request with user data
        :param args: none
        :param kwargs: none
        :return: If there is duplicate user, it returns 400. Otherwise, returns 201.
        """
        password = request.data['password']
        hashed_password = pl_hash.django_pbkdf2_sha256.hash(password)
        data = {
            'email': request.data['email'],
            'first_name': request.data['first_name'],
            'last_name': request.data['last_name'],
            'password_hash': hashed_password,
            'color_pref': request.data['color_pref'],
            'school': request.data['school'],
        }
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @list_route(methods=['put'])
    def change_password(self, request):
        """
        Change the password of the user
        :param request: PUT with email, old_password, and new_password
        :return: Error message or 201 response.
        """
        email = request.data['email']
        old_password = request.data['old_password']
        new_password = request.data['new_password']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return create_error_response('No such user')

        valid = pl_hash.django_pbkdf2_sha256.verify(old_password, user.password_hash)
        if not valid:
            return create_error_response('Invalid password')
        hashed_password = pl_hash.django_pbkdf2_sha256.hash(new_password)
        user.password_hash = hashed_password
        user.save()
        return Response(status=status.HTTP_201_CREATED)

    @detail_route(methods=['post'])
    def join_course(self, request, pk=None):
        """
        Adds a user to a course given an access code.
        :param request: PUT with access_code
        :param pk: Primary key of user
        :return: response 200 on success, otherwise error.
        """
        user = self.get_object()
        error_response = create_error_response("Invalid access code")

        string_code = request.data['access_code']
        ac = string_code.split('-')

        # access code should have 3 parts, with the first part 'student' or 'ta'
        if len(ac) != 3 or (ac[0] != 'student' and ac[0] != 'ta'):
            return error_response
        # try to get the course
        try:
            course = Course.objects.get(id=int(ac[1]))
        except (ValueError, ObjectDoesNotExist):
            return error_response
        # if the code matches the student or ta access code, add the user.
        if ac[0] == 'student' and string_code == course.student_ac:
            course.students.add(user)
            course.save()
            return Response("Added student")
        elif ac[0] == 'ta' and string_code == course.ta_ac:
            course.tas.add(user)
            course.save()
            return Response("Added TA")
        return error_response


# routes /school/. Empty since unused, but allows viewing in browser and basic requests
class SchoolViewSet(ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer


# routes /course/
class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def create(self, request, *args, **kwargs):
        """
        Override create method to create access codes as well.
        :param request: POST with 'name', 'description', 'students', 'tas, 'instructors'. Last three fields optional.
        :return: 201 response
        """
        data = request.data
        course = Course(name=data['name'], description=data['description'])
        course.save()
        # convert to dict to deal with issues of managing the lists passed in
        data = dict(data)
        students, tas, instructors = [], [], []
        # set the students, tas, and instructors
        if 'students' in data:
            students = User.objects.filter(id__in=data['students'])
        if 'tas' in data:
            tas = User.objects.filter(id__in=data['tas'])
        if 'instructors' in data:
            instructors = User.objects.filter(id__in=data['instructors'])
        course.students.set(students)
        course.tas.set(tas)
        course.instructors.set(instructors)
        generate_access_codes(course)
        course.save()
        return Response(status=status.HTTP_201_CREATED)

    @detail_route(methods=['post'])
    def save_course(self, request, pk=None):
        """
        Save course, and regenerate access codes if asked. Students and tas are provided as whitespace/newline
        separated strings with emails.
        :param request: course_name, course_string, students, tas, regenerate_access. If not included, no change.
        :param pk: Primary key of course
        :return: response 201 on success
        """
        course = self.get_object()
        data = request.data
        # update course name/description
        if 'course_name' in data:
            course.name = data['course_name']
        if 'course_description' in data:
            course.description = data['course_description']
        # Split the emails using regular expressions on commas and whitespace. Get those users and update
        if 'students' in data:
            st_emails = re.split("[,\s]+", data['students'])
            students = User.objects.filter(email__in=st_emails)
            course.students.set(students)
        if 'tas' in data:
            ta_emails = re.split("[,\s]+", data['tas'])
            tas = User.objects.filter(email__in=ta_emails)
            course.tas.set(tas)
        # regenerate access codes if requested
        if 'regenerate_access' in data and data['regenerate_access'] == "True":
            generate_access_codes(course)

        course.save()
        return Response("Success")

    @detail_route()
    def get_assignments(self, request, pk=None):
        """
        Get list of assignments of a course with the pk
        :param request: GET
        :param pk: primary key of course
        :return: all assignments for that course
        """
        course = self.get_object()
        assignments = AssignmentSerializer(course.assignment_set, many=True).data
        response = {'assignments': assignments}
        return Response(response)

    @detail_route()
    def get_users(self, request, pk=None):
        """
        Get list of users of a course with the pk
        :param request: GET
        :param pk: primary key of course
        :return: tas, students, and instructors.
        """
        course = self.get_object()
        tas = course.tas
        students = course.students
        instructors = course.instructors

        response = {
            'tas': UserSerializer(tas, many=True).data,
            'students': UserSerializer(students, many=True).data,
            'instructors': UserSerializer(instructors, many=True).data,
        }
        return Response(response)


# routes /assignment/. Empty since unused, but allows viewing in browser and basic requests
class AssignmentViewSet(ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer


# routes /submission/
class SubmissionViewSet(ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    @list_route(methods=['post'])
    def get_submissions(self, request):
        """
        Get all the submissions filtered by userd and/or assignmentid
        :param request: POST containing possibly userid and possibly assignmentid; both are optional
        :return: list of submissions
        """
        queryset = Submission.objects.all()
        submissions = queryset
        # filter by user input
        if "userid" in request.data:
            submissions = submissions.filter(submitter=request.data['userid'])
        if "assignmentid" in request.data:
            submissions = submissions.filter(assignment=request.data['assignmentid'])

        # don't use a serializer, and instead hardcode fields that are desired.
        # this is because fields that are typically not desired when getting an assignment (e.g. course_name) are
        # returned
        def submission_to_json(submission):
            user_email = submission.submitter
            user = User.objects.get(email=user_email)
            try:
                attachment = submission.attachment.url
            except ValueError:
                attachment = ''
            return {'id': submission.id, 'graded_date': submission.graded_date, 'text': submission.text,
                    'assignment': submission.assignment.name, 'course_name': submission.assignment.course.name,
                    'score': submission.score, 'submission_date':submission.submission_date,
                    'first_name': user.first_name, 'last_name': user.last_name, 'submitter_id': user.id,
                    'attachment': attachment}
        submissions_map = list(map(submission_to_json, submissions))
        response = {'submissions': submissions_map}
        return Response(response)
