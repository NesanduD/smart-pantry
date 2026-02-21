from django.urls import path
from .views import (
    UserRegistrationAPIView,
    UserLoginAPIView,
    UserLogoutAPIView,
    IngredientListCreateView,
    IngredientDetailView,
    scan_ingredient_gemini,
    suggest_recipes
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # --- Authentication ---
    # React should hit: /api/register/
    path('register/', UserRegistrationAPIView.as_view(), name='register'),
    # React should hit: /api/login/ (or use /api/token/ from the main urls.py)
    path('login/', UserLoginAPIView.as_view(), name='login'),
    path('logout/', UserLogoutAPIView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # --- Pantry Management ---
    path('ingredients/', IngredientListCreateView.as_view(), name='ingredient-list'),
    path('ingredients/<int:pk>/', IngredientDetailView.as_view(), name='ingredient-detail'),

    # --- AI Features ---
    # This is the endpoint for your image upload
    path('ingredients/scan/', scan_ingredient_gemini, name='scan-ingredient'),
    # This is the endpoint for recipe suggestions
    path('recipes/suggest/', suggest_recipes, name='suggest-recipes'),
]