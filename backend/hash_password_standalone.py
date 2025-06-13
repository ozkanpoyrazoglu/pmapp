# backend/hash_password_standalone.py
# Standalone password hasher - Backend olmadan da çalışır

import sys
import getpass

try:
    from passlib.context import CryptContext
    
    # BCrypt context (backend ile aynı config)
    pwd_context = CryptContext(
        schemes=["bcrypt"],
        deprecated="auto",
        bcrypt__rounds=12
    )
    
    def hash_password_standalone(password):
        """Standalone password hasher"""
        try:
            hashed = pwd_context.hash(password)
            return hashed
        except Exception as e:
            print(f"❌ Error hashing password: {e}")
            return None
    
    def verify_password_standalone(password, hashed):
        """Standalone password verifier"""
        try:
            return pwd_context.verify(password, hashed)
        except Exception as e:
            print(f"❌ Error verifying password: {e}")
            return False
    
    def main():
        print("🔐 Standalone Password Hasher")
        print("============================")
        
        if len(sys.argv) > 1:
            password = sys.argv[1]
        else:
            password = getpass.getpass("Password girin (gizli): ")
        
        if not password:
            print("❌ Password boş olamaz!")
            sys.exit(1)
        
        print(f"\n📝 Input Password: {password}")
        
        # Hash oluştur
        hashed = hash_password_standalone(password)
        
        if hashed:
            print(f"✅ Generated Hash: {hashed}")
            
            # Verification test
            is_valid = verify_password_standalone(password, hashed)
            print(f"🧪 Verification Test: {is_valid}")
            
            if is_valid:
                print("\n" + "="*50)
                print("✅ BAŞARILI - Hash kullanıma hazır!")
                print("="*50)
                print(f"Password: {password}")
                print(f"Hash: {hashed}")
                print("\n📋 MongoDB Update Komutu:")
                print("docker-compose exec mongodb mongosh --eval \"")
                print("use project_management")
                print("db.users.updateOne(")
                print("  {email: 'demo@example.com'},")
                print(f"  {{\\$set: {{hashed_password: '{hashed}'}}}}")
                print(")\"")
                print("\n🔄 Veya tek satırda:")
                print(f"docker-compose exec mongodb mongosh --eval \"use project_management; db.users.updateOne({{email: 'demo@example.com'}}, {{\\$set: {{hashed_password: '{hashed}'}}}})\"")
                
                # Demo user için özel test
                print(f"\n🧪 Demo Login Test Komutu:")
                print(f"curl -X POST \"http://localhost:8000/api/auth/login\" \\")
                print(f"  -H \"Content-Type: application/x-www-form-urlencoded\" \\")
                print(f"  -d \"username=demo@example.com&password={password}\"")
                
            else:
                print("❌ Hash doğrulaması başarısız!")
        else:
            print("❌ Hash oluşturulamadı!")
    
    if __name__ == "__main__":
        main()
        
except ImportError as e:
    print("❌ Import error:", e)
    print("Required packages: passlib[bcrypt]")
    print("Install with: pip install 'passlib[bcrypt]'")
    sys.exit(1)
except Exception as e:
    print("❌ Unexpected error:", e)
    import traceback
    traceback.print_exc()
    sys.exit(1)