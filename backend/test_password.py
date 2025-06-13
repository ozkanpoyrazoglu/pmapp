# backend/test_password.py

import sys
import os

print("=== BCrypt Compatibility Test ===")

try:
    # Test bcrypt import
    import bcrypt
    print(f"✅ bcrypt imported successfully")
    print(f"   bcrypt version: {bcrypt.__version__}")
    
    # Test passlib import
    from passlib.context import CryptContext
    print(f"✅ passlib imported successfully")
    
    # Test passlib with bcrypt
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
    print(f"✅ CryptContext created successfully")
    
    # Test password operations
    test_password = "demo123"
    print(f"\n=== Password Testing ===")
    print(f"Test password: {test_password}")
    
    # Hash password
    hashed = pwd_context.hash(test_password)
    print(f"✅ Password hashed successfully")
    print(f"   Hash: {hashed[:20]}...")
    
    # Verify password
    is_valid = pwd_context.verify(test_password, hashed)
    print(f"✅ Password verification: {is_valid}")
    
    # Test with existing demo hash
    demo_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6KlCB.SGNO"
    is_demo_valid = pwd_context.verify(test_password, demo_hash)
    print(f"✅ Demo hash verification: {is_demo_valid}")
    
    # Test wrong password
    is_wrong = pwd_context.verify("wrongpassword", demo_hash)
    print(f"✅ Wrong password test: {is_wrong} (should be False)")
    
    print(f"\n=== App Import Test ===")
    
    # Test app imports
    from app.auth.utils import verify_password, get_password_hash
    print(f"✅ App auth utils imported successfully")
    
    # Test app functions
    app_hash = get_password_hash(test_password)
    print(f"✅ App password hashing works")
    
    app_verify = verify_password(test_password, app_hash)
    print(f"✅ App password verification: {app_verify}")
    
    app_demo_verify = verify_password(test_password, demo_hash)
    print(f"✅ App demo verification: {app_demo_verify}")
    
    print(f"\n🎉 All tests passed! BCrypt is working correctly.")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print(f"   Check if requirements are installed: pip install -r requirements.txt")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"   Type: {type(e).__name__}")
    
    # Print more details for debugging
    if hasattr(e, '__traceback__'):
        import traceback
        print(f"\nTraceback:")
        traceback.print_exc()
    
    sys.exit(1)

print(f"\n=== Environment Info ===")
print(f"Python version: {sys.version}")
print(f"Python path: {sys.executable}")

# Check installed packages
try:
    import pkg_resources
    packages = ['bcrypt', 'passlib', 'fastapi', 'pydantic']
    for package in packages:
        try:
            version = pkg_resources.get_distribution(package).version
            print(f"{package}: {version}")
        except pkg_resources.DistributionNotFound:
            print(f"{package}: Not found")
except ImportError:
    print("pkg_resources not available")

print("\n=== Test Complete ===")