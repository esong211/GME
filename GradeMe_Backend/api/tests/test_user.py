from django.test import TestCase
from django.db.models import ProtectedError

from rest_framework.test import APIRequestFactory
from rest_framework.utils import json

import api.tests.sample_data as sample

from api.models import User, School, Course
from api.views import UserViewSet, CourseViewSet
import datetime


class UserTestCase(TestCase):
    factory = APIRequestFactory()

    def test_get_school(self):
        """
        Test getting a user's school. Just testing the database object, not code.
        """
        sample.sample_data_one_user()
        me = User.objects.get(email="scsteph2@illinois.edu")
        self.assertEqual("University of Illinois Urbana-Champaign", me.school.name, "Failed getting school name.")

    def test_delete_school_fails(self):
        """
        Deleteing a school for an existing user should cause an error.
        """
        sample.sample_data_one_user()
        uiuc = School.objects.get(name="University of Illinois Urbana-Champaign")
        try:
            uiuc.delete()
            self.assertTrue(False, "Should have thrown ProtectedError - can't delete school that belongs to student.")
        except ProtectedError:
            pass

    def test_get_account_created(self):
        """"
        The account created date should be recent (since it was just created)
        """
        sample.sample_data_one_user()
        me = User.objects.get(email="scsteph2@illinois.edu")
        now = datetime.datetime.now(datetime.timezone.utc)
        self.assertLess(now - me.account_created, datetime.timedelta(hours=2),
                        "New account has timestamp over two hours ago.")

    def test_get_assignments_due_week(self):
        """
        Create sample data with a few assignments, with hw1 due in a day. Check that it is the only assignment
        due in a week
        """
        sample.sample_data_one_course()
        me = User.objects.get(email="scsteph2@illinois.edu")
        view = UserViewSet.as_view(actions={'get': 'assignments_due_week'})
        request = self.factory.get('/user/' + str(me.id) + '/assignments_due_week/')
        response = view(request, pk=me.id)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        satisfying_assignments = json.loads(response.content.decode('utf-8'))
        # check 1 assignment is returned, and it's hw1.
        self.assertEqual(len(satisfying_assignments), 1, "Did not receive exactly one assignment back.")
        self.assertEqual(satisfying_assignments[0]['name'], "hw1", "Incorrect assignment returned.")

    def test_get_assignments_due_week_none(self):
        """
        Create sample data with a user with no assignments due in a week
        """
        sample.sample_data_few()
        me = User.objects.get(email="u3@gmail.com")
        view = UserViewSet.as_view(actions={'get': 'assignments_due_week'})
        request = self.factory.get('/user/' + str(me.id) + '/assignments_due_week/')
        response = view(request, pk=me.id)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        satisfying_assignments = json.loads(response.content.decode('utf-8'))
        # No assignments should be returned
        self.assertEqual(len(satisfying_assignments), 0, "Should not have received an assignment back for u3 "
                                                         "(they are only an instructor).")

    def test_get_course_student_multiple(self):
        """
        Check getting the coruses for a user in multiple courses
        """
        sample.sample_data_few()
        user = User.objects.get(email="u2@gmail.com")
        view = UserViewSet.as_view(actions={'get': 'get_course'})
        request = self.factory.get('/user/' + str(user.id) + '/get_course/')
        response = view(request, pk=user.id)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        courses = json.loads(response.content.decode('utf-8'))
        # check two courses back, 'c2' and 'c23'
        self.assertEqual(len(courses['student']), 2, "User should be a student in 2 classes.")
        self.assertTrue(courses['student'][0]['name'] == 'c2' or courses['student'][1]['name'] == 'c2',
                        "User u2 not in course c2.")
        self.assertTrue(courses['student'][0]['name'] == 'c23' or courses['student'][1]['name'] == 'c23',
                        "User u2 not in course c23.")
        self.assertEqual(len(courses['ta']), 0, "User should not be a TA.")
        self.assertEqual(len(courses['instructor']), 0, "User should not be an Instructor.")

    def test_get_course_instructor(self):
        """
        Check get_course for a user that is an instructor
        """
        sample.sample_data_few()
        user = User.objects.get(email="u3@gmail.com")
        view = UserViewSet.as_view(actions={'get': 'get_course'})
        request = self.factory.get('/user/' + str(user.id) + '/get_course/')
        response = view(request, pk=user.id)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        courses = json.loads(response.content.decode('utf-8'))
        # shoulld only be an instructor of two courses
        self.assertEqual(len(courses['student']), 0, "User should not be a student.")
        self.assertEqual(len(courses['ta']), 0, "User should not be a ta.")
        self.assertEqual(len(courses['instructor']), 2, "User should be an instructor for 2 courses.")
        self.assertTrue(courses['instructor'][0]['name'] == 'c23' or courses['instructor'][1]['name'] == 'c23',
                        "User u3 not in course c23.")
        self.assertTrue(courses['instructor'][0]['name'] == 'c3' or courses['instructor'][1]['name'] == 'c3',
                        "User u3 not in course c3.")

    def create_course_helper(self):
        """
        Helper function that creates a course with basic data
        :return: The course created
        """
        sample.sample_data_one_user()
        data = {
            'name': 'test_name',
            'description': 'test_desc',
        }
        view = CourseViewSet.as_view(actions={'post': 'create'})
        request = self.factory.post('/course/', data)
        response = view(request)
        self.assertEqual(response.status_code, 201, "Did not get a 201 HTTP response.")
        return User.objects.get(id=1), Course.objects.get(name='test_name')

    def try_ac(self, user, ac):
        """
        Helper function to try having user use ac as an access code
        :param user: logged in user
        :param ac: access code they try
        :return: response of post
        """
        data = {'access_code': ac}
        view = UserViewSet.as_view(actions={'post': 'join_course'})
        request = self.factory.post('/course/' + str(user.id) + '/join_course/', data)
        response = view(request, pk=user.id)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        # Check the response
        response.render()
        return json.loads(response.content.decode('utf-8'))

    def test_add_course_student(self):
        """
        Testing adding a student to a course using an access code
        """
        user, course = self.create_course_helper()
        res = self.try_ac(user, course.student_ac)
        self.assertEqual(res, "Added student", "Invalid response")
        self.assertTrue(user in course.students.all(), "User not added to course")

    def test_add_course_ta(self):
        """
        Testing adding a ta to a course using an access code
        """
        user, course = self.create_course_helper()
        res = self.try_ac(user, course.ta_ac)
        self.assertEqual(res, "Added TA", "Invalid response")
        self.assertTrue(user in course.tas.all(), "User not added to course")

    def test_add_course_invalid(self):
        """
        Testing a variety of incorrect access codes
        """
        user, course = self.create_course_helper()
        # mess the access part
        res = self.try_ac(user, course.ta_ac + "a")
        self.assertEqual(res, {'error_msg': 'Invalid access code'}, "Invalid response")
        self.assertFalse(user in course.tas.all(), "User was added to course")
        # try course that doesn't exist (shouldn't throw error)
        res = self.try_ac(user, 'ta-2-blah')
        self.assertEqual(res, {'error_msg': 'Invalid access code'}, "Invalid response")
        self.assertFalse(user in course.tas.all(), "User was added to course")
        # try course wrong code
        res = self.try_ac(user, 'ta-1-blah')
        self.assertEqual(res, {'error_msg': 'Invalid access code'}, "Invalid response")
        self.assertFalse(user in course.tas.all(), "User was added to course")
        # try empty
        res = self.try_ac(user, '')
        self.assertEqual(res, {'error_msg': 'Invalid access code'}, "Invalid response")
        self.assertFalse(user in course.tas.all(), "User was added to course")
        # try garbage
        res = self.try_ac(user, '1-2-3#$%^&*(..\n')
        self.assertEqual(res, {'error_msg': 'Invalid access code'}, "Invalid response")
        self.assertFalse(user in course.tas.all(), "User was added to course")
