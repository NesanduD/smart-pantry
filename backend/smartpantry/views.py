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
    Accepts an image FILE, saves it temporarily, and identifies ingredients.
    """
    image_file = request.FILES.get('image')
    
    if not image_file:
        return Response({"error": "Image file required"}, status=status.HTTP_400_BAD_REQUEST)

    # Save file temporarily to disk so we can open it
    path = default_storage.save(f"tmp/{image_file.name}", ContentFile(image_file.read()))
    full_path = default_storage.path(path)

    try:
        # Call the service function
        results = identify_ingredients(full_path)
        
        # Cleanup
        if os.path.exists(full_path):
            os.remove(full_path)
        
        return Response({"ingredients": results})
    except Exception as e:
        # Cleanup on error
        if os.path.exists(full_path):
            os.remove(full_path)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_recipes(request):
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