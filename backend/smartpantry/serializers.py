from .models import CustomUser, Ingredient
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username", "email")

class UserRegistrationSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ("id", "username", "email", "password1", "password2")

    def validate(self, attrs):
        # 1. Check if passwords match
        if attrs["password1"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # 2. Check password length
        if len(attrs["password1"]) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters long."})
        
        return attrs # Return at the VERY END of the function

    def create(self, validated_data):
        password = validated_data.pop("password1")
        validated_data.pop("password2")
        return CustomUser.objects.create_user(password=password, **validated_data)  

class UserLoginSerializer(serializers.Serializer):
    # If your CustomUser uses 'username' to login, change 'email' to 'username' below
    username = serializers.CharField() 
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user 
        raise serializers.ValidationError("Incorrect credentials provided.")

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'user', 'name', 'quantity', 'expiration_date', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']