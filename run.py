import subprocess
import sys
import os

def main():    
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload"],
        cwd=os.path.join(os.path.dirname(__file__), "")
    )

    try:
        backend.wait()
    except KeyboardInterrupt:
        backend.terminate()

if __name__ == "__main__":
    main()