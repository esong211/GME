from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.utils import json

import api.tests.sample_data as sample

from api.models import User, Course
from api.views import CourseViewSet


class CourseTestCase(TestCase):
    factory = APIRequestFactory()

    def check_get_access_codes(self, course):
        """
        Helper function that checks access codes and returns them
        :param course: Course with access codes to check
        :return: student access code and ta access code (just the code at the end)
        """
        # Check the access codes have the right ta/student name, and course id.
        self.assertNotEqual("", course.ta_ac, "TA access code is empty.")
        self.assertNotEqual("", course.student_ac, "Student access code is empty.")
        ta_ac = course.ta_ac.split('-')
        self.assertEqual(len(ta_ac), 3, "Invalid TA access code format.")
        self.assertEqual(ta_ac[0], "ta")
        self.assertEqual(ta_ac[1], str(course.id), "TA access code does not have course id.")
        student_ac = course.student_ac.split('-')
        self.assertEqual(len(student_ac), 3, "Invalid student access code format.")
        self.assertEqual(student_ac[0], "student")
        self.assertEqual(student_ac[1], str(course.id), "Student access code does not have course id.")
        return student_ac[2], ta_ac[2]

    def test_create(self):
        """
        Try creating a new course, and check that the access codes are also made.
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
        response.render()
        course = Course.objects.get(name='test_name')
        # check the access codes
        self.check_get_access_codes(course)

    def test_create_with_users(self):
        """
        Try creating a new course with users
        """
        sample.sample_data_few()
        data = {
            'name': 'test_name',
            'description': 'test_desc',
            'students': [1, 2],
            'tas': [2, 3],
            'instructors': [3],
        }
        view = CourseViewSet.as_view(actions={'post': 'create'})
        request = self.factory.post('/course/', data)
        response = view(request)
        self.assertEqual(response.status_code, 201, "Did not get a 201 HTTP response.")
        response.render()
        # get the course then check its students, tas, and instructors
        course = Course.objects.get(name='test_name')
        self.check_get_access_codes(course)
        self.assertEqual(len(course.students.all()), 2, "Course should have two students.")
        self.assertEqual(len(course.tas.all()), 2, "Course should have two tas.")
        self.assertEqual(len(course.instructors.all()), 1, "Course should have one instructor.")
        self.assertEqual(course.instructors.all()[0].id, 3, "Course has wrong instructor.")

    def test_create_with_instructor(self):
        """
        Try creating a new course with 1 instructor (the common use case)
        Even though not passed in, students and tas should be init to empty
        """
        sample.sample_data_few()
        data = {
            'name': 'test_name',
            'description': 'test_desc',
            'instructors': [2],
        }
        view = CourseViewSet.as_view(actions={'post': 'create'})
        request = self.factory.post('/course/', data)
        response = view(request)
        self.assertEqual(response.status_code, 201, "Did not get a 201 HTTP response.")
        response.render()
        course = Course.objects.get(name='test_name')
        # check the access codes
        self.check_get_access_codes(course)
        insts = course.instructors.all()
        self.assertEqual(len(insts), 1, "Course should have one instructor.")
        self.assertEqual(insts[0].email, "u2@gmail.com", "Instructor should be u2")

    def test_save_course(self):
        """
        Try saving a course with 'normal' parameters. Changes all fields
        """
        sample.sample_data_one_course()
        course = Course.objects.get(name="CS428")
        data = {
            "course_name": "new_name",
            "course_description": "new_description",
            "students": "",
            "tas": "scsteph2@illinois.edu",
            "regenerate_access": True,
        }
        view = CourseViewSet.as_view(actions={'post': 'save_course'})
        request = self.factory.post('/course/' + str(course.id) + "/save_course/", data)
        response = view(request, pk=course.pk)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()

        # check the students and tas
        course = Course.objects.get(name='new_name')
        self.assertEqual(len(course.students.all()), 0, "should have 0 students now")
        self.assertEqual(len(course.tas.all()), 1, "should have 1 ta now")
        # save the access codes
        acs = self.check_get_access_codes(course)

        # rerun, check that access is different
        response = view(request, pk=course.pk)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        course = Course.objects.get(name='new_name')
        acs2 = self.check_get_access_codes(course)
        self.assertNotEqual(acs[0], acs2[0], "Student access code unchanged")
        self.assertNotEqual(acs[1], acs2[1], "Student access code unchanged")

        # rerun and check access is the same
        data["regenerate_access"] = False
        request = self.factory.post('/course/' + str(course.id) + "/save_course/", data)
        response = view(request, pk=course.pk)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        course = Course.objects.get(name='new_name')
        self.assertEqual(self.check_get_access_codes(course), acs2, "Access codes shouldn't have changed")

    def test_save_course_invalid(self):
        """
        Try saving a course with garbage ta list. This is direct user input, so must be tested specially
        """
        sample.sample_data_one_course()
        course = Course.objects.get(name="CS428")
        data = {
            "course_name": "new_name",
            "course_description": "new_description",
            "students": "",
            "tas": "non_user scsteph2,@illinois.edu !@#$%^&*()_\b\\",
            "regenerate_access": True,
        }
        view = CourseViewSet.as_view(actions={'post': 'save_course'})
        request = self.factory.post('/course/' + str(course.id) + "/save_course/", data)
        response = view(request, pk=course.pk)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()

        # make sure they have no tas or students
        course = Course.objects.get(name='new_name')
        self.assertEqual(len(course.tas.all()), 0, "Should have no tas")
        self.assertEqual(len(course.students.all()), 0, "Should have no students")

    def test_save_course_many(self):
        """
        Try saving many users with possible duplicate whitespace, commas, or emails
        """
        sample.sample_data_few()
        course = Course.objects.get(name="c1")
        data = {
            "course_description": "new_description",
            "students": "u1@gmail.com,,\n,u2@gmail.com",
            "tas": "u2@gmail.com  u3@gmail.com  u3@gmail.com",
            "regenerate_access": True,
        }
        view = CourseViewSet.as_view(actions={'post': 'save_course'})
        request = self.factory.post('/course/' + str(course.id) + "/save_course/", data)
        response = view(request, pk=course.pk)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()

        # Check the course
        course = Course.objects.get(name='c1')
        self.assertEqual(len(course.students.all()), 2, "Should have 2 students")
        self.assertEqual(len(course.tas.all()), 2, "Should have 2 tas")

    def test_save_course_empty(self):
        """
        try saving no changes (nothing should change)
        """
        sample.sample_data_few()
        course = Course.objects.get(name="c1")
        data = {}
        view = CourseViewSet.as_view(actions={'post': 'save_course'})
        request = self.factory.post('/course/' + str(course.id) + "/save_course/", data)
        response = view(request, pk=course.pk)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()

        # check properties are the same
        course = Course.objects.get(name='c1')
        self.assertEqual(course.description, "Course One", "Course description should be unchanged")
        self.assertEqual(len(course.students.all()), 1, "Should have 2 student")
        self.assertEqual(len(course.tas.all()), 0, "Should have 0 tas")

    def test_get_models(self):
        """
        Test getting the instructors, students, and assignments of a course. This is checking the models are working,
        not anything implemented.
        """
        sample.sample_data_few()
        course = Course.objects.get(name="c23")
        # Get a course, check its instructors and students
        self.assertEqual(course.instructors.count(), 1, "Course doesn't have exactly one instructor.")
        self.assertEqual(course.students.count(), 1, "Course doesn't have exactly one student.")
        self.assertEqual(course.assignment_set.count(), 1, "Course doesn't have exactly one assignment.")
        # check its assignments
        ass = course.assignment_set.get(name="c23hw1")
        self.assertEqual(ass.submission_set.count(), 1, "assignment doesn't have exactly one submission")
        # check the assignment submission
        u2 = User.objects.get(email="u2@gmail.com")
        sub = ass.submission_set.get(submitter=u2)
        self.assertEqual(sub.text, "My submission", "Incorrect submission text.")

    def test_get_assignments(self):
        """
        Test getting the assignments of a course
        """
        sample.sample_data_few()
        course = Course.objects.get(name="c1")
        view = CourseViewSet.as_view(actions={'get': 'get_assignments'})
        request = self.factory.get('/course/' + str(course.id) + '/get_assignments/')
        response = view(request, pk=course.id)
        # Check the response
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        assignments = json.loads(response.content.decode('utf-8'))
        # Check that the course has two assignments, hw1 and hw2.
        self.assertTrue('assignments' in assignments, "Did not get valid response")
        assignments = assignments['assignments']
        self.assertEqual(len(assignments), 2, "Course should have 2 assignments.")
        self.assertTrue(assignments[0]['description'] == 'Homework 1' or assignments[1]['description'] == 'Homework 1',
                        'Homework 1 should be returned')
        self.assertTrue(assignments[0]['description'] == 'Homework 2' or assignments[1]['description'] == 'Homework 2',
                        'Homework 2 should be returned')

    def test_get_assignments_empty(self):
        """
        Test getting the assignments of ac ourse with no assignments
        """
        sample.sample_data_few()
        course = Course.objects.get(name="c4")
        view = CourseViewSet.as_view(actions={'get': 'get_assignments'})
        request = self.factory.get('/course/' + str(course.id) + '/get_assignments/')
        response = view(request, pk=course.id)
        # Check the response
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        assignments = json.loads(response.content.decode('utf-8'))
        self.assertTrue('assignments' in assignments, "Did not get valid response")
        assignments = assignments['assignments']
        # should be empty
        self.assertEqual(len(assignments), 0, "Course should have no assignments.")

    def test_get_users(self):
        """
        Test getting the users of a course (students, tas, instructors)
        """
        sample.sample_data_one_course()
        course = Course.objects.get(name="CS428")
        view = CourseViewSet.as_view(actions={'get': 'get_users'})
        request = self.factory.get('/course/' + str(course.id) + '/get_assignments/')
        response = view(request, pk=course.id)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        users = json.loads(response.content.decode('utf-8'))
        # check contains one student and nothing else
        self.assertTrue('students' in users, "Did not get valid response")
        self.assertEqual(len(users['students']), 1, "Did not get one user back.")
        self.assertEqual(len(users['tas']), 0, "Course should have no TAs.")
        self.assertEqual(len(users['instructors']), 0, "Course should have no instructors.")

    def test_get_users_multiple(self):
        """
        Test getting the users of a course with a student and instructor
        """
        sample.sample_data_few()
        course = Course.objects.get(name="c23")
        view = CourseViewSet.as_view(actions={'get': 'get_users'})
        request = self.factory.get('/course/' + str(course.id) + '/get_assignments/')
        response = view(request, pk=course.id)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        users = json.loads(response.content.decode('utf-8'))
        # should have 1 student and 1 instructor
        self.assertTrue('students' in users , "Did not get valid response")
        self.assertEqual(len(users['students']), 1, "Did not get one user back.")
        self.assertEqual(len(users['tas']), 0, "Course should have no TAs.")
        self.assertEqual(len(users['instructors']), 1, "Did not got one instructor back.")
