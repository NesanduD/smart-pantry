import json
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import GenericAPIView 

from .models import Ingredient, CustomUser
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    CustomUserSerializer, 
    IngredientSerializer
)
from .services.google_gemini_service import identify_ingredients, suggest_recipes_from_ingredients

# --- SCANNING LOGIC ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_ingredient_gemini(request):
    image_file = request.FILES.get('image')
    
    # Grab the model choice from the frontend, default to flash if it's missing
    selected_model = request.data.get('model', 'gemini-2.0-flash')
    
    if not image_file:
        return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

    path = default_storage.save(f"tmp/{image_file.name}", ContentFile(image_file.read()))
    full_path = default_storage.path(path)

    try:
        # Pass selected_model down to the AI service
        raw_text = identify_ingredients(full_path, model_name=selected_model)
        detected_names = [name.strip().lower() for name in raw_text.split(',') if name.strip()]

        for name in detected_names:
            Ingredient.objects.get_or_create(
                user=request.user,
                name=name,
                defaults={'quantity': 1, 'expiration_date': '2026-12-31'}
            )

        # Pass selected_model down for recipe generation too
        recipes_json = suggest_recipes_from_ingredients(detected_names, model_name=selected_model)
        
        try:
            recipes_data = json.loads(recipes_json)
        except:
            recipes_data = []

        if os.path.exists(full_path):
            os.remove(full_path)

        return Response({
            "detected_ingredients": detected_names,
            "pantry_updated": True,
            "suggested_recipes": recipes_data
        })

    except Exception as e:
        if os.path.exists(full_path):
            os.remove(full_path)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- RECIPE LOGIC ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_recipes(request):
    ingredients = request.data.get("ingredients", [])
    
    # Grab the model choice from the frontend
    selected_model = request.data.get('model', 'gemini-2.0-flash')
    
    if not ingredients:
        return Response({"error": "Ingredients list required"}, status=status.HTTP_400_BAD_REQUEST)

    # Pass the model down
    recipes_json_str = suggest_recipes_from_ingredients(ingredients, model_name=selected_model)
    
    try:
        data = json.loads(recipes_json_str)
    except:
        data = []

    return Response({"recipes": data})

# --- AUTH LOGIC ---
class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {
            "refresh": str(token),
            "access": str(token.access_token)
        }
        return Response(data, status=status.HTTP_201_CREATED)

class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        user_data = CustomUserSerializer(user).data
        token = RefreshToken.for_user(user)
        user_data["tokens"] = {
            "refresh": str(token),
            "access": str(token.access_token)
        }
        return Response(user_data, status=status.HTTP_200_OK)

class UserLogoutAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- PANTRY LOGIC ---
class IngredientListCreateView(generics.ListCreateAPIView):
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ingredient.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IngredientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ingredient.objects.filter(user=self.request.user)