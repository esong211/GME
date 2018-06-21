from api.models import *
from datetime import datetime, timedelta, timezone
import passlib.hash as plh


def hash_pass(password):
    """
    Helper function to hash a password in the same way the database hashes it.
    :param password: pasword to hash
    :return: hash of password
    """
    return plh.django_pbkdf2_sha256.hash(password)


def sample_data_one_user():
    """
    Create one user, scsteph2, in UIUC.
    :return: sam the user
    """
    uiuc = School(name="University of Illinois Urbana-Champaign")
    uiuc.save()
    sam = User(first_name="Sam", last_name="Stephens", email="scsteph2@illinois.edu",
               password_hash=hash_pass("hello!"), color_pref="pink", school=uiuc)
    sam.save()
    return sam


def sample_data_one_course():
    """
    Create the user as before. Add a course and 3 homework assignments, with one due in a day, and two due in 10 days.
    """
    sam = sample_data_one_user()
    cs428 = Course(name="CS428", description="Continuation of CS 427. Software development, management, and "
                                             "maintenance. Project and configuration management, collaborative "
                                             "development models, software quality assurance, interoperability domain "
                                             "engineering and software reuse, and software re-engineering.")
    cs428.save()
    cs428.students.add(sam)
    today = datetime.now(timezone.utc)
    hw1 = Assignment(name="hw1", description="Homework 1", start_date=today-timedelta(days=5),
                     end_date=today+timedelta(days=1), course=cs428)
    hw2 = Assignment(name="hw2", description="Homework 2", start_date=today-timedelta(days=5),
                     end_date=today+timedelta(days=10), course=cs428)
    hw0 = Assignment(name="hw0", description="Homework 0", start_date=today-timedelta(days=15),
                     end_date=today-timedelta(days=10), course=cs428)
    hw0.save()
    hw1.save()
    hw2.save()


def sample_data_few():
    """
    Create a few courses, students, assignments. Given easy to remember names.
    u1 is in school1 and takes c1 as a student.
    u2 is in school2 and takes c2, c23 as a student.
    u3 is in school2 and instructs c23, c3
    c4 has no users or assignments.
    c1, c2, c23, and c3 all have 'hw1' due tomorrow, with c1 also having hw2 due in a week
    u2 submitted an assignment to c23hw1, and u1 submitted an assignment to c3hw1
    """
    # some helper dates
    today = datetime.now(timezone.utc)
    yesterday = today - timedelta(days=1)
    tomorrow = today + timedelta(days=1)
    future = today + timedelta(days=7)

    # create the schools
    school1 = School(name="school1")
    school1.save()
    school2 = School(name="school2")
    school2.save()

    # create the users
    u1 = User(first_name="user", last_name="1", email="u1@gmail.com",
              password_hash=hash_pass("u1pw"), color_pref="Blue", school=school1)
    u1.save()
    u2 = User(first_name="user", last_name="2", email="u2@gmail.com",
              password_hash=hash_pass("u2pw"), color_pref="Green", school=school2)
    u2.save()
    u3 = User(first_name="user", last_name="3", email="u3@gmail.com",
              password_hash=hash_pass("u3pw"), color_pref="Red", school=school2)
    u3.save()

    # create the courses
    c1 = Course(name="c1", description="Course One")
    c2 = Course(name="c2", description="Course Two")
    c23 = Course(name="c23", description="Course Two-Three")
    c3 = Course(name="c3", description="Course Three")
    c1.save()
    c1.students.add(u1)
    c2.save()
    c2.students.add(u2)
    c23.save()
    c23.students.add(u2)
    c23.instructors.add(u3)
    c3.save()
    c3.instructors.add(u3)

    # create the assignments
    c1hw1 = Assignment(name="c1hw1", description="Homework 1",
                       start_date=yesterday, end_date=tomorrow, course=c1)
    c1hw2 = Assignment(name="c1hw2", description="Homework 2",
                       start_date=tomorrow, end_date=future, course=c1)
    c2hw1 = Assignment(name="c2hw1", description="Homework 1",
                       start_date=yesterday, end_date=tomorrow, course=c2)
    c23hw1 = Assignment(name="c23hw1", description="Homework 1",
                        start_date=yesterday, end_date=tomorrow, course=c23)
    c3hw1 = Assignment(name="c3hw1", description="Homework 1",
                       start_date=yesterday, end_date=tomorrow, course=c3)
    for ass in [c1hw1, c1hw2, c2hw1, c23hw1, c3hw1]:
        ass.save()

    # create some submissions
    sub1 = Submission(submission_date=yesterday, graded_date=today, score='90', text='My submission',
                      assignment=c23hw1, submitter=u2)
    sub2 = Submission(submission_date=today, graded_date=today, score='100', text='My submission2',
                      assignment=c3hw1, submitter=u1)
    sub1.save()
    sub2.save()

    # add an extra empty course
    c4 = Course(name="c4", description="Course Four")
    c4.save()