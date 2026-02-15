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
    path('register/', UserRegistrationAPIView.as_view()),
    path('login/', UserLoginAPIView.as_view()),
    path('logout/', UserLogoutAPIView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path('ingredients/', IngredientListCreateView.as_view()),
    path('ingredients/<int:pk>/', IngredientDetailView.as_view()),
    path('ingredients/scan/', scan_ingredient_gemini),
    path("scan-gemini/", scan_ingredient_gemini, name="scan-ingredient-gemini"),
    path('recipes/suggest/', suggest_recipes, name='suggest-recipes'),
]