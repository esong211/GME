from django.test import TestCase
from rest_framework.test import APIRequestFactory
from rest_framework.utils import json

import api.tests.sample_data as sample

from api.models import School
from api.views import UserViewSet


class AuthenticateTestCase(TestCase):
    factory = APIRequestFactory()

    def authenticate(self, email, password):
        """
        Helper function to login a user
        :param email: email of user
        :param password: password of user
        :return: Response of authenticate post
        """
        view = UserViewSet.as_view(actions={'post': 'authenticate'})
        request = self.factory.post('/user/authenticate/', {'email': email, 'password': password})
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        return json.loads(response.content.decode('utf-8'))

    def test_authenticate_user_valid(self):
        """
        Try logging in a registered user
        """
        sample.sample_data_one_user()
        out = self.authenticate('scsteph2@illinois.edu', 'hello!')
        self.assertTrue('token' in out.keys())

    def test_authenticate_user_invalid_password(self):
        """
        Try logging in with invalid password
        """
        sample.sample_data_one_user()
        out = self.authenticate('scsteph2@illinois.edu', 'not my password')
        self.assertDictEqual(out, {'error_msg': 'Invalid password'})

    def test_authenticate_user_invalid_user(self):
        """
        Try logging in a user that does not exist
        """
        out = self.authenticate('notanemail@illinois.edu', 'hello!')
        self.assertDictEqual(out, {'error_msg': 'No such user'})

    def test_create_new_user(self):
        """
        Try cretaing a new user, then try loggin in as them
        """
        sample.sample_data_one_user()
        school_id = School.objects.get().id
        view = UserViewSet.as_view(actions={'post': 'create'})
        email = 'user2@illinois.edu'
        password = 'passw0rd!'
        # form data to submit
        data = {
            'email': email,
            'password': password,
            'school': school_id,
            'first_name': 'first',
            'last_name': 'last',
            'color_pref': 'green'}
        request = self.factory.post('/user/', data)
        response = view(request)
        self.assertEqual(response.status_code, 201, "Did not get a 201 HTTP response.")
        # make sure user can login
        out = self.authenticate(email, password)
        self.assertTrue('token' in out.keys())

    def test_create_new_user_invalid(self):
        """
        Create a new user with a name too long, check that 400 is returned
        """
        sample.sample_data_one_user()
        school_id = School.objects.get().id
        view = UserViewSet.as_view(actions={'post': 'create'})
        email = 'user2@illinois.edu'
        password = 'passw0rd!'
        data = {
            'email': email,
            'password': password,
            'school': school_id,
            'first_name': 'too long' * 100,
            'last_name': 'last',
            'color_pref': 'green'}
        request = self.factory.post('/user/', data)
        response = view(request)
        # Check 400 response
        self.assertEqual(response.status_code, 400, "Should get invalid response")

    def test_decode_token_bad(self):
        """
        try to token an invalid token, check that response is error
        """
        view = UserViewSet.as_view(actions={'post': 'decode_token'})
        data = {
            'token': 'bad_token_data'
        }
        request = self.factory.post('/user/decode_token/', data)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # should get error
        self.assertTrue('error_msg' in data)

    def test_authenticate_decode(self):
        """
        authenticate a user, then try to decode the token response
        """
        sample.sample_data_one_user()
        out = self.authenticate('scsteph2@illinois.edu', 'hello!')
        self.assertTrue('token' in out)
        view = UserViewSet.as_view(actions={'post': 'decode_token'})
        request = self.factory.post('/user/decode_token/', out)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # should not get error
        self.assertTrue('error_msg' not in data)

    def test_encode_token(self):
        """
        encode then decode an arbitrary token
        """
        # encode some sample data
        view = UserViewSet.as_view(actions={'post': 'encode_token'})
        to_encode = {'test_data': 'test_value'}
        request = self.factory.post('/user/encode_token/', to_encode)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # make sure token is in response, then decode
        self.assertTrue('token' in data)
        view = UserViewSet.as_view(actions={'post': 'decode_token'})
        request = self.factory.post('/user/decode_token/', data)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # data should be equal
        self.assertEqual(data, to_encode)

    def test_encode_token_empty(self):
        """
        encode then decode an empty token
        """
        view = UserViewSet.as_view(actions={'post': 'encode_token'})
        to_encode = {}
        request = self.factory.post('/user/encode_token/', to_encode)
        response = view(request)
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        # make sure token is in response, then decode
        self.assertTrue('token' in data)
        view = UserViewSet.as_view(actions={'post': 'decode_token'})
        request = self.factory.post('/user/decode_token/', data)
        response = view(request)
        # Check the response
        self.assertEqual(response.status_code, 200, "Did not get a 200 HTTP response.")
        response.render()
        data = json.loads(response.content.decode('utf-8'))
        self.assertEqual(data, to_encode)

    def test_change_password(self):
        """
        try to change the password for a user
        """
        email = 'scsteph2@illinois.edu'
        old_pass = 'hello!'
        new_pass = 'new_pass'
        # sample data
        sample.sample_data_one_user()
        # check the original login
        out = self.authenticate(email, old_pass)
        self.assertTrue('token' in out)
        # change the password
        view = UserViewSet.as_view(actions={'put': 'change_password'})
        data = {'email': email, 'old_password': old_pass, 'new_password': new_pass}
        request = self.factory.put('/user/change_password/', data)
        response = view(request)
        # Check the response
        self.assertEqual(response.status_code, 201, "Did not get a 201 HTTP response.")
        response.render()
        out = self.authenticate(email, new_pass)
        # check authenticated
        self.assertTrue('token' in out)
