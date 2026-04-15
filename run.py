import subprocess
import sys
import os

def main():
    frontend = subprocess.Popen(
        ["npm.cmd", "run", "dev"],
        cwd=os.path.join(os.path.dirname(__file__), "frontend")
    )
    
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload"],
        cwd=os.path.join(os.path.dirname(__file__), "")
    )

    try:
        frontend.wait()
        backend.wait()
    except KeyboardInterrupt:
        frontend.terminate()
        backend.terminate()

if __name__ == "__main__":
    main()