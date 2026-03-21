from rest_framework import serializers
from .models import IncomeStatus
from .models import RetirementInfo
from .models import UserData
from django.contrib.auth.models import User
from .models import LifeExpectancy
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the Django User model"""
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserDataSerializer(serializers.ModelSerializer):
    """Serializer for user personal details"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserData
        fields = [
            "id",
            "user",
            "name",
            "dateOfBirth",
            "gender",
            "location",
            "maritalStatus",
            "numberOfDependants",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "user", "createdAt", "updatedAt"]


class IncomeStatusSerializer(serializers.ModelSerializer):
    """Serializer for Income Status model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = IncomeStatus
        fields = [
            "id",
            "user",
            "currentSalary",
            "yearsOfService",
            "employerType",
            "pensionScheme",
            "pensionBalance",
            "employerContribution",
            "yourContribution",
        ]


class RetirementInfoSerializer(serializers.ModelSerializer):
    """Serializer for Retirement Info model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = RetirementInfo
        fields = "__all__"

class LifeExpectancySerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeExpectancy
        fields = [
            'Height', 'Weight', 'Gender', 'BMI', 'Physical_Activity',
            'Smoking_Status', 'Alcohol_Consumption', 'Diet', 'Blood_Pressure',
            'Cholesterol', 'Asthma', 'Diabetes', 'Heart_Disease', 'Hypertension',
            'predicted_life_expectancy', 'is_skipped', 'created_at'
        ]
        read_only_fields = ['created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for manual user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True, max_length=30)
    last_name = serializers.CharField(required=True, max_length=30)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        """Validate password confirmation and strength"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        
        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        
        return attrs

    def create(self, validated_data):
        """Create user with validated data"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Use email as username since we're using email authentication
        validated_data['username'] = validated_data['email']
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for manual user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate user credentials"""
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Try to authenticate with email as username
            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            raise serializers.ValidationError("Email and password are required.")

        return attrs