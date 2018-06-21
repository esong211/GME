from django.db import models


class School(models.Model):
    """
    A school just contains a name.
    """
    name = models.CharField(max_length=50, unique=True, default="UIUC")


class User(models.Model):
    """
    The most important model. Contains some basic user properties and settings.
    Password is store hashed, and is handled by the overwritten create.
    Also contains fields 'students', 'tas', and 'instructors' that store the courses that the user is a student, ta,
      or instructor of.
    """
    first_name = models.CharField(max_length=25)
    last_name = models.CharField(max_length=25)
    email = models.EmailField(unique=True)
    color_pref = models.CharField(max_length=10)
    account_created = models.DateTimeField(auto_now_add=True)
    password_hash = models.CharField(max_length=128)

    # One to many relationship with school
    school = models.ForeignKey('School', on_delete=models.PROTECT)

    def __str__(self):
        return self.email

    class Meta:
        ordering = ('email',)


class Course(models.Model):
    """
    Basic course info, including access codes (created by overwritten created), as well as the many-to-many fields
      with user.
    Also contains ont-to-many-filed 'assignment_set' that stores all assignments.
    """
    name = models.CharField(max_length=30)
    description = models.TextField()

    student_ac = models.CharField(max_length=30, default="")
    ta_ac = models.CharField(max_length=30, default="")

    students = models.ManyToManyField('User', related_name="students", blank=True)
    tas = models.ManyToManyField('User', related_name="tas", blank=True)
    instructors = models.ManyToManyField('User', related_name="instructors")


class Assignment(models.Model):
    """
    Assignment info, including attachment. Also contains 'submission_set' that contains all attachments.
    Course is a one-to-many field that gets the course for the assignment.
    """
    name = models.CharField(max_length=20)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    attachment = models.FileField(upload_to='assignments/', blank=True)

    course = models.ForeignKey('Course', on_delete=models.CASCADE)


class Submission(models.Model):
    """
    Submission info, including attachment. Assignment is a one-to-many field that gets the assignment.
    Also contains submitter, a one-to-many that represents the user that submitted this.
    """
    submission_date = models.DateTimeField()
    graded_date = models.DateTimeField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    text = models.TextField()
    attachment = models.FileField(upload_to='submissions/', blank=True)
    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE)
    submitter = models.ForeignKey('User', on_delete=models.CASCADE)
