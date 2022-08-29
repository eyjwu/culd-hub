from smtplib import SMTPException

import graphene
from django.contrib.sessions.models import Session
from django.core.signing import BadSignature, SignatureExpired
from django.utils import timezone

from api.bases import Output
from api.types import UserType
from .constants import Messages
from .exceptions import TokenScopeError, EmailAlreadyInUse
from .forms import RegisterForm
from .models import User
from .tokens import action_token, TokenAction


class RegisterMixin(Output):
    form = RegisterForm
    user = graphene.Field(UserType)

    def __new__(cls, *args, **kwargs):
        return super(RegisterMixin, cls).__new__(cls)

    @classmethod
    def mutate(cls, root, info, **kwargs):
        try:
            email = kwargs.get("email")
            if not User.email_is_free(email):
                raise EmailAlreadyInUse
            f = cls.form(kwargs)
            if f.is_valid():
                user = f.save()
                return cls(success=True, user=user)
            else:
                return cls(success=False, errors=f.errors.get_json_data())
        except EmailAlreadyInUse:
            return cls(success=False, errors={User.EMAIL_FIELD: Messages.EMAIL_IN_USE})


class LogoutUserMixin(Output):
    def __new__(cls, *args, **kwargs):
        return super(LogoutUserMixin, cls).__new__(cls)

    @classmethod
    def mutate(cls, root, info, **kwargs):
        try:
            for session in Session.objects.filter(expire_date__gte=timezone.now()):
                if str(info.context.user.pk) == session.get_decoded().get(
                    "_auth_user_id"
                ):
                    session.delete()
            return cls(success=True)
        except Exception:
            return cls(success=False, errors=Messages.LOGOUT_FAIL)


class SendPasswordResetEmailMixin(Output):
    def __new__(cls, *args, **kwargs):
        return super(SendPasswordResetEmailMixin, cls).__new__(cls)

    @classmethod
    def mutate(cls, root, info, **kwargs):
        try:
            email = kwargs.get("email")
            user = User.objects.get(email=email)
            if user:
                user.send_password_reset_email(info, [email])
            return cls(success=True, errors=None)
        except SMTPException:
            return cls(success=False, errors=Messages.EMAIL_FAIL)


class ResetPasswordMixin(Output):
    def __new__(cls, *args, **kwargs):
        return super(ResetPasswordMixin, cls).__new__(cls)

    @classmethod
    def mutate(cls, root, info, **kwargs):
        user_id = kwargs.get("user_id")
        token = kwargs.get("token")
        try:
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        try:
            if user and action_token.check_token(
                user, token, TokenAction.PASSWORD_RESET
            ):
                user.set_password(kwargs.get("password"))
                user.save()
            else:
                return cls(success=False, errors=Messages.INVALID_TOKEN)
        except SignatureExpired:
            return cls(success=False, errors=Messages.EXPIRED_TOKEN)
        except (BadSignature, TokenScopeError):
            return cls(success=False, errors=Messages.INVALID_TOKEN)
        return cls(success=True)
