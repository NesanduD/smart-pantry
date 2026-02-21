from django.shortcuts import render
from rest_framework.generics import GenericAPIView 
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
import os

# --- CORRECTED IMPORTS ---
from .services.google_gemini_service import identify_ingredients, suggest_recipes_from_ingredients

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scan_ingredient_gemini(request):
    """
    1. Identifies ingredients from an image.
    2. Saves them to the User's pantry (database).
    3. Suggests recipes immediately.
    """
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

    # Save temp file for processing
    path = default_storage.save(f"tmp/{image_file.name}", ContentFile(image_file.read()))
    full_path = default_storage.path(path)

    try:
        # Step 1: Call Gemini to get raw text (e.g., "Tomato, Onion, Egg")
        raw_text = identify_ingredients(full_path)
        
        # Step 2: Convert string to a clean Python list
        detected_names = [name.strip().lower() for name in raw_text.split(',') if name.strip()]

        # Step 3: Save to Database (Pantry)
        # We use get_or_create to avoid making 10 entries for "Tomato"
        for name in detected_names:
            Ingredient.objects.get_or_create(
                user=request.user,
                name=name,
                defaults={'quantity': 1, 'expiration_date': '2026-12-31'}
            )

        # Step 4: Automatically get recipes using the detected list
        recipes_json = suggest_recipes_from_ingredients(detected_names)
        try:
            recipes_data = json.loads(recipes_json)
        except:
            recipes_data = []

        # Cleanup
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
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_recipes(request):
    ingredients = request.data.get("ingredients", [])
    selected_model = request.data.get("model", "gemini-3-flash-preview") # Get model from React

    if not ingredients:
        return Response({"error": "Ingredients list required"}, status=status.HTTP_400_BAD_REQUEST)

    recipes_json_str = suggest_recipes_from_ingredients(ingredients, selected_model)
    
    try:
        data = json.loads(recipes_json_str)
    except:
        data = []

    return Response({"recipes": data})
    """
    Takes a list of ingredients and returns recipes.
    """
    # Fix: Check if data is already a list, otherwise try to get the 'ingredients' key
    if isinstance(request.data, list):
        ingredients = request.data
    else:
        ingredients = request.data.get("ingredients", [])

    if not ingredients:
        return Response({"error": "Ingredients list required"}, status=status.HTTP_400_BAD_REQUEST)

    # ... rest of your code ...
    recipes_json_str = suggest_recipes_from_ingredients(ingredients)
    
    try:
        data = json.loads(recipes_json_str)
    except:
        data = []

    return Response({"recipes": data})

# ... (Keep your UserRegistrationAPIView, UserLoginAPIView, etc. below) ...
class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token),
                          "access": str(token.access_token)}
        return Response(data, status=status.HTTP_201_CREATED)
    
class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = CustomUserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token),
                          "access": str(token.access_token)}
        return Response(data, status=status.HTTP_200_OK)
    
class UserLogoutAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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