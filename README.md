# Simple 3D CAD Tool for testing vibe coding

A simple 3D CAD tool built with Django and Three.js.

## Features

*   Create and view 3D objects (lines, circles, cubes).
*   Move and delete objects.
*   Import and export scenes in JSON format.
*   Basic user authentication.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/django-cad-tool.git
    cd django-cad-tool
    ```

2.  **Create a virtual environment and install dependencies:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

## Running the Application

1.  **Apply database migrations:**

    ```bash
    python manage.py migrate
    ```

2.  **Run the development server:**

    ```bash
    python manage.py runserver
    ```

3.  Open your browser and navigate to `http://127.0.0.1:8000/`.

## Project Structure

```
django-cad-tool/
|-- cad_tool/            # Django app for the CAD tool
|   |-- migrations/      # Database migrations
|   |-- static/          # Static files (JS, CSS)
|   |-- templates/       # HTML templates
|   |-- __init__.py
|   |-- admin.py
|   |-- apps.py
|   |-- models.py
|   |-- serializers.py
|   |-- tests.py
|   |-- urls.py
|   `-- views.py
|-- django_cad_tool/     # Django project settings
|   |-- __init__.py
|   |-- asgi.py
|   |-- settings.py
|   |-- urls.py
|   `-- wsgi.py
|-- db.sqlite3           # SQLite database
|-- manage.py            # Django management script
`-- requirements.txt     # Python dependencies
```

## API Endpoints

*   `GET /api/entities/`: Retrieve all entities.
*   `POST /api/entities/`: Create a new entity.
*   `DELETE /api/entities/<id>/`: Delete an entity.
*   `PATCH /api/entities/<id>/`: Update an entity.
*   `POST /api/import_JSON/`: Import entities from a JSON file.
*   `POST /api/export_JSON/`: Export entities to a JSON file.

## Usage

*   **Create:** Select a shape from the left panel and click on the canvas to create it.
*   **Delete:** Click the "Delete" button and then click on an object to remove it.
*   **Move:** Click the "Move" button, select an object, and then click on the new location.
*   **Import/Export:** Use the "Import JSON" and "Export JSON" buttons to save and load your work.

## Copyright
MIT license

## Author
Taewook Kang. 
