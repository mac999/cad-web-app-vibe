const THREE = window.THREE;
const OrbitControls = THREE.OrbitControls;

let scene, camera, renderer, controls;
let raycaster, mouse;
let selectedObject = null;
let mode = null; // 'line', 'circle', 'cube', 'delete', 'move'
let points = [];

const statusPanel = document.getElementById('statusPanel');


function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const canvas = document.getElementById('canvas');
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);

    // Add Grid
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    // Add Axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Add a cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    canvas.addEventListener('mousedown', onMouseDown, false);

    // Load initial data
    loadEntities();

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), intersectPoint);

    if (mode) {
        switch (mode) {
            case 'line':
                points.push(intersectPoint);
                if (points.length === 1) {
                    statusPanel.textContent = 'Click the end point.';
                } else {
                    createEntity({ entity_type: 'Line', parameters: { start: points[0], end: points[1] } });
                    points = [];
                    mode = null;
                    statusPanel.textContent = 'Ready';
                }
                break;
            case 'circle':
                points.push(intersectPoint);
                if (points.length === 1) {
                    statusPanel.textContent = 'Click to set the radius.';
                } else {
                    const center = points[0];
                    const radius = center.distanceTo(points[1]);
                    createEntity({ entity_type: 'Circle', parameters: { center: center, radius: radius } });
                    points = [];
                    mode = null;
                    statusPanel.textContent = 'Ready';
                }
                break;
            case 'cube':
                createEntity({ entity_type: 'Cube', parameters: { position: intersectPoint, width: 1, height: 1, depth: 1 } });
                mode = null;
                statusPanel.textContent = 'Ready';
                break;
            case 'delete':
                if (intersects.length > 0) {
                    deleteEntity(intersects[0].object);
                    mode = null;
                    statusPanel.textContent = 'Ready';
                }
                break;
            case 'move':
                if (selectedObject) {
                    moveEntity(selectedObject, intersectPoint);
                    selectedObject = null;
                    mode = null;
                    statusPanel.textContent = 'Ready';
                } else {
                    if (intersects.length > 0) {
                        selectObject(intersects[0].object);
                        statusPanel.textContent = 'Click the location to move to.';
                    }
                }
                break;
        }
    } else {
        if (intersects.length > 0) {
            selectObject(intersects[0].object);
        }
    }
}

function selectObject(object) {
    if (selectedObject) {
        selectedObject.material.color.set(selectedObject.userData.originalColor);
    }
    selectedObject = object;
    selectedObject.userData.originalColor = selectedObject.material.color.getHexString();
    selectedObject.material.color.set(0xff0000);
}

async function loadEntities() {
    const response = await fetch('/api/entities/');
    const entities = await response.json();
    entities.forEach(entity => {
        const object = createObjectFromEntity(entity);
        scene.add(object);
    });
}

async function createEntity(entity) {
    const response = await fetch('/api/entities/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(entity)
    });
    const newEntity = await response.json();
    const object = createObjectFromEntity(newEntity);
    scene.add(object);
}

async function deleteEntity(object) {
    const entityId = object.userData.id;
    await fetch(`/api/entities/${entityId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    });
    scene.remove(object);
}

async function moveEntity(object, newPosition) {
    const entityId = object.userData.id;
    const entity = {
        parameters: { ...object.userData.parameters, position: newPosition }
    };
    const response = await fetch(`/api/entities/${entityId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(entity)
    });
    const updatedEntity = await response.json();
    object.position.set(newPosition.x, newPosition.y, newPosition.z);
}

function createObjectFromEntity(entity) {
    let geometry, material, object;

    if (entity.entity_type === 'Line') {
        material = new THREE.LineBasicMaterial({ color: entity.color });
    } else {
        material = new THREE.MeshStandardMaterial({ color: entity.color });
    }

    switch (entity.entity_type) {
        case 'Line':
            const points = [];
            points.push(new THREE.Vector3(entity.parameters.start.x, entity.parameters.start.y, entity.parameters.start.z));
            points.push(new THREE.Vector3(entity.parameters.end.x, entity.parameters.end.y, entity.parameters.end.z));
            geometry = new THREE.BufferGeometry().setFromPoints(points);
            object = new THREE.Line(geometry, material);
            break;
        case 'Circle':
            geometry = new THREE.CircleGeometry(entity.parameters.radius, 32);
            object = new THREE.Mesh(geometry, material);
            object.position.set(entity.parameters.center.x, entity.parameters.center.y, entity.parameters.center.z);
            break;
        case 'Cube':
            geometry = new THREE.BoxGeometry(entity.parameters.width, entity.parameters.height, entity.parameters.depth);
            object = new THREE.Mesh(geometry, material);
            object.position.set(entity.parameters.position.x, entity.parameters.position.y, entity.parameters.position.z);
            break;
    }

    object.userData = entity;
    return object;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

document.getElementById('createLine').addEventListener('click', () => { 
    mode = 'line'; 
    statusPanel.textContent = 'Click the start point.'; 
});
document.getElementById('createCircle').addEventListener('click', () => { 
    mode = 'circle'; 
    statusPanel.textContent = 'Click the center point.'; 
});
document.getElementById('createCube').addEventListener('click', () => { 
    mode = 'cube'; 
    statusPanel.textContent = 'Click to place the cube.'; 
});
document.getElementById('deleteBtn').addEventListener('click', () => {
    mode = 'delete';
    statusPanel.textContent = 'Select the object to delete.';
});

document.getElementById('moveBtn').addEventListener('click', () => {
    mode = 'move';
    statusPanel.textContent = 'Select the object to move.';
});

document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/import_JSON/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    });

    const entities = await response.json();
    // Clear existing objects
    while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    entities.forEach(entity => {
        const object = createObjectFromEntity(entity);
        scene.add(object);
    });
});

document.getElementById('exportFile').addEventListener('click', async () => {
    const entities = [];
    scene.children.forEach(child => {
        if (child.userData.id) { // Filter out lights, etc.
            entities.push(child.userData);
        }
    });

    const response = await fetch('/api/export_JSON/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(entities)
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'entities.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
});

document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    scene.children.forEach(child => {
        if (child.userData.id) { // Filter out lights, etc.
            const entity = child.userData;
            const name = entity.name ? entity.name.toLowerCase() : '';
            const type = entity.entity_type.toLowerCase();

            if (name.includes(searchText) || type.includes(searchText)) {
                child.visible = true;
            } else {
                child.visible = false;
            }
        }
    });
});

init();
