import subprocess
import os

base = os.path.dirname(os.path.abspath(__file__))

backend = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd=os.path.join(base, "backend")
)

frontend = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd=os.path.join(base, "frontend")
)

print("✅ Backend running on http://localhost:8000")
print("✅ Frontend running on http://localhost:5173")
print("Press Ctrl+C to stop both...")

try:
    backend.wait()
    frontend.wait()
except KeyboardInterrupt:
    print("\nStopping...")
    backend.terminate()
    frontend.terminate()