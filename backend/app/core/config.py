"""
Configuration settings for tidyframe.com
Environment-based configuration with validation
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator, ValidationError, Field
from typing import List, Optional
import secrets
import os
import sys


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Basic Application Settings
    PROJECT_NAME: str = "tidyframe.com"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False  # Default to False for security
    
    # Security - CRITICAL: Must be set via environment variables
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for production
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    PASSWORD_MIN_LENGTH: int = 12  # Increased from 8 to 12 for better security
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 30
    
    # Additional security settings
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_DIGIT: bool = True
    PASSWORD_REQUIRE_SPECIAL: bool = True
    
    # CORS and Security Headers
    # Use str type and convert to list in property to avoid pydantic-settings JSON parsing
    ALLOWED_HOSTS_STR: str = "tidyframe.com,www.tidyframe.com,api.tidyframe.com,app.tidyframe.com,localhost,127.0.0.1,0.0.0.0"
    
    @property
    def ALLOWED_HOSTS(self) -> List[str]:
        """Parse ALLOWED_HOSTS from comma-separated string"""
        return [host.strip() for host in self.ALLOWED_HOSTS_STR.split(",")]
    
    # Database Configuration
    DATABASE_URL: str = Field(default="postgresql+asyncpg://tidyframe:password@localhost:5432/tidyframe")
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_POOL_PRE_PING: bool = True
    
    # Redis Configuration
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    REDIS_CACHE_TTL: int = 3600  # 1 hour
    
    # Celery Configuration - derive from REDIS_URL
    @property
    def CELERY_BROKER_URL(self) -> str:
        # Replace the database number for Celery broker
        if '/' in self.REDIS_URL:
            # If REDIS_URL has a database suffix like /0, replace it
            base_url = self.REDIS_URL.rsplit('/', 1)[0] if self.REDIS_URL.count('/') > 2 else self.REDIS_URL
        else:
            base_url = self.REDIS_URL
        return f"{base_url}/1"
    
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        # Replace the database number for Celery result backend  
        if '/' in self.REDIS_URL:
            # If REDIS_URL has a database suffix like /0, replace it
            base_url = self.REDIS_URL.rsplit('/', 1)[0] if self.REDIS_URL.count('/') > 2 else self.REDIS_URL
        else:
            base_url = self.REDIS_URL
        return f"{base_url}/2"
    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: List[str] = ["json"]
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_TIMEZONE: str = "UTC"
    CELERY_ENABLE_UTC: bool = True
    
    # File Upload Settings
    MAX_FILE_SIZE_MB: int = 200
    ANONYMOUS_MAX_FILE_SIZE_MB: int = 1  # 1MB limit for anonymous users
    ALLOWED_FILE_TYPES: List[str] = [".csv", ".xlsx", ".xls", ".txt"]
    UPLOAD_DIR: str = "/app/uploads"
    RESULTS_DIR: str = "/app/results"
    VIRUS_SCANNING_ENABLED: bool = True
    
    # Processing Limits
    STANDARD_TIER_MONTHLY_LIMIT: int = 100000  # 100k names included in $80/month
    ENTERPRISE_TIER_MONTHLY_LIMIT: int = 10000000  # 10M for enterprise
    ANONYMOUS_LIFETIME_LIMIT: int = 5  # Free anonymous trial
    STANDARD_OVERAGE_PRICE: float = 0.002  # $0.002 per name after 100k
    MAX_ROWS_PER_FILE: int = 1000000
    PROCESSING_TIMEOUT_MINUTES: int = 60
    
    # File Retention Settings
    # ALL processed result files are deleted after 10 minutes for ALL users
    POST_PROCESSING_RETENTION_MINUTES: int = 10  # Files deleted after 10 minutes for everyone
    
    # Gemini Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_FALLBACK_MODEL: str = "gemini-2.5-flash-lite"
    GEMINI_MAX_CONCURRENT: int = 20
    GEMINI_RATE_LIMIT_PER_MINUTE: int = 60
    GEMINI_TIMEOUT_SECONDS: int = 30
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_BILLING_METER_WEBHOOK_SECRET: str = ""
    STRIPE_STANDARD_MONTHLY_PRICE_ID: str = ""
    STRIPE_STANDARD_YEARLY_PRICE_ID: str = ""
    STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: str = ""
    STRIPE_ENTERPRISE_YEARLY_PRICE_ID: str = ""
    STRIPE_OVERAGE_PRICE_ID: str = ""
    STRIPE_PRODUCT_ID: str = ""
    STRIPE_METER_ID: str = ""
    
    # Billing configuration
    STANDARD_MONTHLY_PRICE: float = 80.0
    STANDARD_YEARLY_PRICE: float = 768.0  # 20% discount
    MONTHLY_NAME_LIMIT: int = 100000
    OVERAGE_PRICE_PER_UNIT: float = 0.01
    STANDARD_OVERAGE_PRICE: float = 0.01  # Legacy field for compatibility
    RESEND_API_KEY: str = ""
    
    # Email Configuration
    FROM_EMAIL: str = "noreply@tidyframe.com"
    SUPPORT_EMAIL: str = "support@tidyframe.com"
    
    # Monitoring and Logging
    LOG_LEVEL: str = "INFO"
    ENABLE_METRICS: bool = True
    SENTRY_DSN: Optional[str] = None
    
    # Rate Limiting and Security
    RATE_LIMIT_PER_MINUTE: int = 60
    API_RATE_LIMIT_PER_MINUTE: int = 1000
    ENABLE_SECURITY_HEADERS: bool = True
    ENABLE_HSTS: bool = True  # Only applied in production
    ENABLE_CSP: bool = True
    
    # Request Security Limits
    MAX_REQUEST_SIZE_MB: int = 200  # Same as file upload limit
    REQUEST_TIMEOUT_SECONDS: int = 300  # 5 minutes
    
    # Cookie Security Settings
    COOKIE_SECURE: bool = True  # HTTPS only in production
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"  # or "strict" for more security
    
    # Additional Security Settings
    ENABLE_REQUEST_LOGGING: bool = True
    LOG_SENSITIVE_DATA: bool = False  # Never log passwords, tokens, etc.
    BLOCK_SUSPICIOUS_REQUESTS: bool = True
    
    # Processing Settings
    BATCH_SIZE: int = 50
    CACHE_TTL_SECONDS: int = 3600
    ENABLE_CACHING: bool = True
    BILLING_PERIOD: str = "daily"
    
    # JWT Algorithm
    JWT_ALGORITHM: str = "HS256"
    
    # Site Password Protection (Pre-launch)
    # These MUST be loaded from environment variables, not defaults
    ENABLE_SITE_PASSWORD: bool = Field(default=False, env="ENABLE_SITE_PASSWORD")
    SITE_PASSWORD: str = Field(default="", env="SITE_PASSWORD")
    
    
    class Config:
        # Intelligently select environment file based on ENVIRONMENT variable
        # Priority: 1) .env (copied by tidyframe.sh), 2) .env.production/development, 3) fallback to .env
        @staticmethod
        def get_env_file():
            # First check if .env exists (created by tidyframe.sh or docker)
            if os.path.exists(".env"):
                return ".env"
            # Check ENVIRONMENT variable to determine which file to use
            env_mode = os.getenv("ENVIRONMENT", "development")
            if env_mode == "production":
                if os.path.exists(".env.production"):
                    return ".env.production"
            else:
                if os.path.exists(".env.development"):
                    return ".env.development"
            # Fallback to .env if nothing else exists
            return ".env"
        
        env_file = get_env_file()
        env_file_encoding = "utf-8"
        case_sensitive = True
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._validate_security_settings()
    
    def _validate_security_settings(self):
        """Validate critical security settings"""
        errors = []
        
        # Check SECRET_KEY
        if not self.SECRET_KEY or self.SECRET_KEY == "CHANGE-THIS-IN-PRODUCTION-USE-ENV-VAR":
            if self.ENVIRONMENT == "production":
                errors.append("SECRET_KEY must be set via environment variable for production")
            else:
                # Generate a secure key for development if not set
                self.SECRET_KEY = secrets.token_urlsafe(64)
        
        # Validate SECRET_KEY length and strength
        if len(self.SECRET_KEY) < 32:
            errors.append("SECRET_KEY must be at least 32 characters long")
        
        # Check production settings
        if self.ENVIRONMENT == "production":
            if self.DEBUG:
                errors.append("DEBUG must be False in production")
            
            # Check required production API keys
            production_keys = [
                ('STRIPE_SECRET_KEY', self.STRIPE_SECRET_KEY),
                ('GEMINI_API_KEY', self.GEMINI_API_KEY)
            ]
            
            for key_name, key_value in production_keys:
                if not key_value or key_value.startswith("your-") or key_value.startswith("sk_test_"):
                    errors.append(f"{key_name} must be set with production values")
        
        # Check site password configuration
        if self.ENABLE_SITE_PASSWORD:
            if not self.SITE_PASSWORD:
                errors.append("SITE_PASSWORD must be set when ENABLE_SITE_PASSWORD is True")
            elif len(self.SITE_PASSWORD) < 8 and self.ENVIRONMENT == "production":
                errors.append("SITE_PASSWORD must be at least 8 characters in production")
        
        # Check database configuration
        if "password" in self.DATABASE_URL.lower() and "localhost" not in self.DATABASE_URL:
            if self.ENVIRONMENT == "production":
                if "password@" in self.DATABASE_URL:
                    errors.append("DATABASE_URL contains default password in production")
        
        if errors:
            print("\n❌ CRITICAL SECURITY CONFIGURATION ERRORS:")
            for error in errors:
                print(f"   • {error}")
            print("\nPlease fix these issues before running the application.\n")
            
            if self.ENVIRONMENT == "production":
                sys.exit(1)
            else:
                print("⚠️  Running in development mode with auto-generated keys.\n")

# Create global settings instance
settings = Settings()