# Simple 3D CAD Tool for testing vibe coding

A simple 3D CAD tool built with Django and Three.js.

## Features

*   Create and view 3D objects (lines, circles, cubes).
*   Move and delete objects.
*   Import and export scenes in JSON format.
*   Basic user authentication.

<img src="https://github.com/mac999/cad-web-app-vibe/blob/main/img2.png" height="400" />

## Prompt
Develop a web-based 3D CAD tool using Django, Three.js, Bootstrap, and SQLite stack. First, **set up a Django project** and **define a SQLite database model** to store CAD entity data. The model should be named `CadEntity` and contain the fields `entity_type` (options include Line, Arc, Circle, Cube, Cylinder, Sphere), `name` (optional), and `color` (default #ffffff) that all entities have in common. Design the unique parameters for each entity type to be managed in a JSON field called `parameters` (in a format usable by SQLite). Create an initial migration file as well.

Then, implement a **RESTful API endpoint** in the Django backend. Create an API that provides the following functionality using the `CadEntity` model:

1. **Create Entity (POST)**: Receive CAD entity data sent from the client to the `/api/entities/` endpoint, store it in SQLite, and return the stored entity information. It should include data validation (e.g., whether required fields are missing).

2. **Get All Entities (GET)**: When a request comes to the `/api/entities/` endpoint, return all CAD entity data stored in SQLite in JSON format.

Now, let's develop the front-end. Apply **Bootstrap 4** to the HTML file to configure the layout of 4 panels (left menu, top header, center canvas, bottom status panel). In the center panel, include the `<canvas>` tag for the Three.js canvas.

In JavaScript, we will implement the following using **Three.js**:

1. **Initialize 3D scene**: Set up camera, renderer, light, scene objects, and add `OrbitControls` to enable canvas manipulation (rotation, zoom, translation).
2. **Initial entity loading**: Call the `/api/entities/` API of the Django backend to load all the saved CAD entity data, and write the logic to **convert each entity type (Line, Arc, Circle, etc.) to a 3D object and render it on the Three.js canvas**. We will need to apply unique parameters for each entity (e.g. start/end point of a line, center/radius of a circle) using the `parameters` field.

Add the ability for users to create CAD entities directly on the canvas.

1. **Left menu panel**: Create **CAD entity creation menu buttons** such as 'Line', 'Circle', and 'Cube' with Bootstrap.
2. **Line entity creation**:
* When the 'Line' button is clicked, display the message Click the start point in the bottom status panel.
* When the user clicks the first point on the canvas, obtain the corresponding 3D coordinates, and click the end point. Display the message.
* When the second point is clicked, obtain the 3D coordinates.
* POST the Line entity data containing the coordinates of the two points to the Django `/api/entities/` API and save it to the database.
* After the server response, render the corresponding line in real time on the Three.js canvas.
3. **Update the bottom status panel**: Implement JavaScript logic that appropriately changes the status message according to the user's click.

Implement the JSON file Import/Export function.

1. **Import (JSON file → SQLite → Three.js)**:
* Add an 'Import File' button to the left menu panel, and connect the file selection input field.
* When the user selects and uploads a JSON file, the file is sent as a **POST request (multipart/form-data)** to the Django `/api/import_JSON/` API.
* In the Django backend, the **`ezJSON` library** is used to parse the uploaded JSON file, and the entities (LINE, CIRCLE, etc.) in the JSON are mapped to the `CadEntity` model and saved to SQLite.
* After saving, **return the entire entity list including the newly loaded entities to the client**, and the client (Three.js) renders it on the canvas.
2. **Export (Three.js → SQLite → JSON file)**:
* Add an 'Export File' button to the left menu panel. * When the 'Export File' button is clicked, **parameter information of all CAD entities** currently rendered on the Three.js canvas is extracted and **POSTed to the Django `/api/export_JSON/` API.**
* In the Django backend, a JSON file is generated using the **`ezJSON` library** based on the entity data received, and it can be **downloaded to the client as an HTTP response**.

o edit CAD entities on the Three.js canvas.

1. **Select Object**: Implement the ability to select 3D entities within the canvas using **Raycasting** when clicking the mouse. The selected entities should be visually highlighted (e.g., change color).

2. **Delete**:
* Add a 'Delete' button to the left menu panel. * After clicking the 'Delete' button, if the user selects an entity on the canvas, remove the entity from the Three.js scene and send a **DELETE request to the Django `/api/entities/{id}/` API** to delete it from SQLite.
* Select the object to delete in the bottom status panel. Display the message.
3. **Move**:
* Add a 'Move' button to the left menu panel.
* After clicking the 'Move' button, if the user selects an entity on the canvas, display the message Click the location to move to in the bottom status panel.
* Move the selected entity to the second click point in the Three.js scene and send a **PUT or PATCH request** to the Django `/api/entities/{id}/` API to update the changed location information in SQLite.


Finally, implement the following additional features.

1. **Search CAD Objects**: Add a search menu with a text input field to the top header panel. When the user enters an entity name or type here, implement client-side logic to filter and display the corresponding entities on the Three.js canvas (e.g. hide or blur the rest).
2. **Login/Logout**: Add 'Login' and 'Logout' buttons to the top header panel, and implement user login/logout functionality using Django's default authentication system. The visibility of the buttons should change depending on the login status.
3. **Save (Save current canvas state)**:
* Add a 'Save' button to the left menu panel. * When the 'Save' button is clicked, **the latest parameter information of all CAD entities** currently existing in the Three.js canvas is extracted and **a POST or PUT request is sent to the Django `/api/save_all_entities/` API.**
* In the Django backend, the SQLite `CadEntity` table is **completely updated (new data is inserted after deleting existing data)** with the received data. This is linked to the `Load` function to preserve the current working state.

Please write considering the following Three.js example (https://github.com/mrdoob/three.js/blob/master/editor/index.html) specifications. 

<img src="https://github.com/mac999/cad-web-app-vibe/blob/main/img1.png" height="400" />

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
