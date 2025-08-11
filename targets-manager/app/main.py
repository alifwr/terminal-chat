from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from typing import Union
from pathlib import Path
import subprocess
import logging
import docker
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity; adjust as needed
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods; adjust as needed
    allow_headers=["*"],  # Allow all headers; adjust as needed
)

@app.on_event("startup")
async def startup_event():
    """
    Startup event to initialize the application.
    This can be used to load configurations or perform initial setup.
    """
    # Load benchmarks from a JSON file
    benchmarks_file = Path(__file__).parent / "benchmarks/benchmarks.json"
    if benchmarks_file.exists():
        with open(benchmarks_file, "r") as file:
            app.state.benchmarks = json.load(file)
    else:
        app.state.benchmarks = {}

    client = docker.from_env()
    # Optionally, you can check if Docker is running
    try:
        client.ping()
        container = get_containers()
        if container:
            logger.info(f"Found {len(container)} running containers.")
        else:
            logger.info("No running containers found.")
        logger.info("Docker is running.")
    except Exception as e:
        logger.error(f"Error connecting to Docker: {str(e)}")
        app.state.benchmarks = {}

    logger.info("Application started and benchmarks loaded.")

@app.get("/benchmarks")
async def get_benchmarks() -> Union[dict, str]:
    """
    Endpoint to retrieve benchmarks.
    Returns a dictionary with benchmark data or an error message.
    """
    try:
        # Simulate fetching benchmarks
        return app.state.benchmarks
    except Exception as e:
        return str(e)
    
@app.get("/turn-on/{target_id}")
async def turn_on_target(target_id: str) -> Union[dict, str]:
    """
    Endpoint to turn on a specific target.
    """
    try:
        # Access the benchmarks list from app.state
        benchmarks = app.state.benchmarks.get("benchmarks", [])
        
        # Find the target benchmark by name
        for benchmark in benchmarks:
            if benchmark["name"] == target_id:
                # Use the path directly from benchmarks.json, relative to app/benchmarks
                benchmark_path = Path("./app/benchmarks") / benchmark.get("path", "").lstrip("./")
                result = run_command(f"cd {benchmark_path} && make build FLAG=someflaggoeshere && docker compose up -d")

                generated_containers = get_containers(target_id)
                if generated_containers:
                    logger.info(f"Generated containers for {target_id}: {[c for c in generated_containers]}")

                if result:
                    return {"message": f"Target {target_id} turned on.", "command_output": result, "containers": [c for c in generated_containers]}
                else:
                    return {"message": f"Target {target_id} turned on, but no command output."}
                
    except Exception as e:
        return str(e)
    
@app.get("/turn-off/{target_id}")
async def turn_off_target(target_id: str) -> Union[dict, str]:
    """
    Endpoint to turn off a specific target.
    """
    try:
        # Access the benchmarks list from app.state
        benchmarks = app.state.benchmarks.get("benchmarks", [])
        
        # Find the target benchmark by name
        for benchmark in benchmarks:
            if benchmark["name"] == target_id:
                # Use the path directly from benchmarks.json, relative to app/benchmarks
                benchmark_path = Path("./app/benchmarks") / benchmark.get("path", "").lstrip("./")
                result = run_command(f"cd {benchmark_path} && docker compose down")
                if result:
                    return {"message": f"Target {target_id} turned off.", "command_output": result}
                else:
                    return {"message": f"Target {target_id} turned off, but no command output."}

        # If no matching target is found
        return {"error": "Target not found."}
    except Exception as e:
        return str(e)


def get_containers(filter: str = '') -> list:
    """
    Get a list of running Docker containers.
    """
    try:
        logger.info(f"Fetching containers with filter: {filter}")
        client = docker.from_env()
        containers = client.containers.list()

        if filter:
            return [{
                "name": c.name,
                "id": c.id,
                "status": c.status,
                "ports": c.attrs.get('NetworkSettings', {}).get('Ports', {})
            } for c in containers if filter.lower() in c.name.lower()]

        return [{
            "name": c.name,
            "id": c.id,
            "status": c.status,
            "ports": c.attrs.get('NetworkSettings', {}).get('Ports', {})
        } for c in containers]

    except Exception as e:
        logger.error(f"Error fetching containers: {str(e)}")
        return []

def run_command(command: str) -> str:
    """
    Run a shell command asynchronously and return the output.
    """
    try:
        logger.info(f"Executing command: {command}")
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info(f"Command executed successfully. Output: {result.stdout.strip()}")
            return result.stdout.strip() if result.stdout else result.stderr.strip()
        else:
            logger.error(f"Command failed with return code {result.returncode}. Error: {result.stderr.strip()}")
            return result.stderr.strip()
    except Exception as e:
        logger.error(f"Exception occurred while executing command: {str(e)}")
        return str(e)