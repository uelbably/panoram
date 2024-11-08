// Initialize the scene, camera, and renderer for the 3D layout
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8; // Bring the camera closer to the images

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for interactivity
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// Function to add an image in 3D space while preserving aspect ratio
function addImageToScene(url, x, y, z) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
        const aspectRatio = texture.image.width / texture.image.height;
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);

        // Set scale based on aspect ratio to maintain the original dimensions
        const scaleFactor = 2; // Adjust this factor to control the image size
        sprite.scale.set(scaleFactor * aspectRatio, scaleFactor, 1);
        sprite.position.set(x, y, z);
        scene.add(sprite);
    }, undefined, (error) => {
        console.error('Error loading texture:', error); // Log any loading errors
    });
}

// Function to search for images and display them in 3D
async function searchImages() {
    const prompt = document.getElementById("prompt").value;
    const maxResults = 100; // Total images we want
    const images = [];

    // Loop to fetch images in batches of 10
    for (let i = 1; images.length < maxResults; i += 10) {
        try {
            // Replace direct Google API call with call to your serverless function
            const response = await fetch(`/api/search?query=${prompt}&start=${i}`);
            if (!response.ok) {
                throw new Error(`Error fetching images: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.items && data.items.length > 0) {
                images.push(...data.items);
                console.log(`Batch ${i}: Received ${data.items.length} images`);
            } else {
                console.warn(`Batch ${i}: No items found.`);
            }
        } catch (error) {
            console.error('Error:', error);
            // Continue to the next iteration instead of breaking the loop
            continue;
        }
    }

    // Clear previous images from the 3D scene
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // Now use the total images fetched to display them in 3D
    const totalImages = images.length; // Get the total number of images
    if (totalImages === 0) {
        console.log('No images to display.');
        return; // If there are no images, exit the function
    }

    // Display each image as a sprite in 3D space arranged in a filled oval shape
    const a = 10; // Semi-major axis (horizontal radius)
    const b = 5;  // Semi-minor axis (vertical radius)

    // Calculate the number of rows and columns based on the number of images
    const rows = Math.ceil(Math.sqrt(totalImages)); // Calculate number of rows
    const cols = Math.ceil(totalImages / rows); // Calculate number of columns

    const horizontalSpacing = 3; // Adjust this value to increase spacing between images
    const verticalSpacing = 2; // Adjust this value to increase spacing between images

    images.forEach((image, index) => {
        const row = Math.floor(index / cols); // Determine the current row
        const col = index % cols; // Determine the current column

        // Calculate the position based on row and column
        const x = (col - (cols / 2)) * (a / cols) * horizontalSpacing; // X position
        const y = 0; // Keep y flat
        const z = (row - (rows / 2)) * (b / rows) * verticalSpacing; // Z position

        addImageToScene(image.url, x, y, z);
    });
}

// Animation loop to render the 3D scene
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Enable Enter key submission
document.getElementById("prompt").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchImages();
    }
});
