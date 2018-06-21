from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.utils import json

import api.tests.sample_data as sample

from api.models import Submission
from api.views import SubmissionViewSet


class SubmissionTestCase(TestCase):
    factory = APIRequestFactory()

    def test_get_submission(self):
        """
        Try getting a submission (just testing models, not code)
        """
        sample.sample_data_few()
        submission = Submission.objects.all()
        self.assertTrue(len(submission) != 0, "Failed getting submission")

    def test_delete_submission(self):
        """
        Try deleting a submission (just testing models, not code)
        """
        sample.sample_data_few()
        submission = Submission.objects.get(pk=1)
        submission.delete()
        try:
            Submission.objects.get(pk=1)
            self.assertFalse(True, "Exception should have been thrown")
        except Submission.DoesNotExist:
            pass

    def test_get_submissions_userid(self):
        """
        Test get_submissions using userid filter
        """
        sample.sample_data_few()
        view = SubmissionViewSet.as_view(actions={'post': 'get_submissions'})
        data = {'userid': 1}
        request = self.factory.post('/submission/get_submissions/', data)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # should have 1 submission with 1 assignment
        self.assertEqual(len(data['submissions']), 1, "Incorrect number of submissions returned.")
        self.assertEqual(data['submissions'][0]['assignment'], 'c3hw1', "Received wrong data.")

    def test_get_submissions_empty(self):
        """
        test get_submissions with no results
        """
        sample.sample_data_one_user()
        view = SubmissionViewSet.as_view(actions={'post': 'get_submissions'})
        data = {'userid': 1}
        request = self.factory.post('/submission/get_submissions/', data)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # should get nothing back
        self.assertEqual(len(data['submissions']), 0, "Should have no submissions.")

    def test_get_submissions_no_filter(self):
        """
        test get_submissions with no filter
        """
        sample.sample_data_few()
        view = SubmissionViewSet.as_view(actions={'post': 'get_submissions'})
        data = {}
        request = self.factory.post('/submission/get_submissions/', data)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        self.assertEqual(len(data['submissions']), 2, "Should have two submissions.")

    def test_get_submissions_assignment_filter(self):
        """
        Test get_submissions using assignment filter
        """
        sample.sample_data_few()
        view = SubmissionViewSet.as_view(actions={'post': 'get_submissions'})
        data = {'assignmentid': 4}
        request = self.factory.post('/submission/get_submissions/', data)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # Should have one submission
        self.assertEqual(len(data['submissions']), 1, "Should have one submission.")
        self.assertEqual(data['submissions'][0]['assignment'], "c23hw1", "Incorrect submission.")

    def test_get_submissions_both_filter(self):
        """
        Test get_submissions using both filters
        :return:
        """
        sample.sample_data_few()
        view = SubmissionViewSet.as_view(actions={'post': 'get_submissions'})
        data = {'userid': 2, 'assignmentid': 4}
        request = self.factory.post('/submission/get_submissions/', data)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # Should have one submission
        self.assertEqual(len(data['submissions']), 1, "Should have one submission.")
        self.assertEqual(data['submissions'][0]['assignment'], "c23hw1", "Incorrect submission.")
