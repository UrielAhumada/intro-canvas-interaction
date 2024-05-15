const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "black"; // Cambiar el color de fondo a negro

// Variable para almacenar las coordenadas del mouse
let mouseX = 0;
let mouseY = 0;

// Variable para almacenar la posición del clic
let clickX = 0;
let clickY = 0;

// Variable para determinar si se hizo clic dentro del círculo
let isClickedInsideCircle = false;

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color; // Guardar el color original
        this.text = text;
        this.speed = speed;

        this.dx = 1 * this.speed;
        this.dy = -1 * this.speed; // Cambiado a negativo para que vaya de abajo hacia arriba
    }

    draw(context) {
        context.beginPath();

        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();

        context.fillStyle = "white"; // Cambiar el color del texto a blanco
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
    }

    update(context) {
        this.draw(context);

        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx; // Invertir la dirección horizontal
            this.color = this.originalColor; // Restaurar el color original al rebotar
        }

        if ((this.posY + this.radius) < 0) { // Cambiar la condición para eliminar el círculo cuando traspase el borde superior
            circles.splice(circles.indexOf(this), 1);
        }

        this.posX += this.dx;
        this.posY += this.dy;
    }

    // Método para verificar si un punto está dentro del círculo
    isPointInside(x, y) {
        const distance = Math.sqrt((x - this.posX) ** 2 + (y - this.posY) ** 2);
        return distance < this.radius;
    }
}

function getDistance(posX1, posY1, posX2, posY2) {
    return Math.sqrt(Math.pow((posX2 - posX1), 2) + Math.pow((posY2 - posY1), 2));
}

let circles = [];

function createCircle() {
    const radius = Math.random() * 50 + 20;
    const x = Math.random() * (window_width - 2 * radius) + radius;
    const y = window_height + radius; // Iniciar desde abajo

    const color = "blue"; // Cambiar el color inicial del círculo a azul
    const text = circles.length + 1;
    const speed = Math.random() * 2 + 1;

    circles.push(new Circle(x, y, radius, color, text, speed));
}

function updateCircles() {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);
    circles.forEach(circle => circle.update(ctx));
    checkCollisions();
}

function checkCollisions() {
    for (let i = 0; i < circles.length; i++) {
        for (let j = 0; j < circles.length; j++) {
            if (i !== j) {
                if (getDistance(circles[i].posX, circles[i].posY, circles[j].posX, circles[j].posY) < (circles[i].radius + circles[j].radius)) {
                    circles[i].color = "green"; // Cambiar el color a verde si hay colisión
                    circles[j].color = "green";

                    // Calcular la nueva dirección para el primer círculo
                    const dx = circles[i].posX - circles[j].posX;
                    const dy = circles[i].posY - circles[j].posY;
                    const angle = Math.atan2(dy, dx);

                    circles[i].dx = Math.cos(angle) * circles[i].speed;
                    circles[i].dy = Math.abs(Math.sin(angle) * circles[i].speed) * -1; // Asegurar que siga subiendo

                    // Calcular la nueva dirección para el segundo círculo
                    circles[j].dx = -Math.cos(angle) * circles[j].speed;
                    circles[j].dy = Math.abs(Math.sin(angle) * circles[j].speed) * -1; // Asegurar que siga subiendo
                }
            }
        }
    }
}

// Función para obtener las coordenadas del mouse dentro del canvas
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}

// Manejador de eventos para detectar el movimiento del mouse
canvas.addEventListener('mousemove', function(evt) {
    getMousePos(canvas, evt);
});

// Manejador de eventos para detectar el clic del mouse
canvas.addEventListener('mousedown', function(evt) {
    clickX = evt.clientX - canvas.getBoundingClientRect().left;
    clickY = evt.clientY - canvas.getBoundingClientRect().top;

    // Verifica si el clic está dentro del círculo
    circles.forEach((circle, index) => {
        if (circle.isPointInside(clickX, clickY)) {
            circles.splice(index, 1); // Elimina el círculo
        }
    });
});

// Función para actualizar las coordenadas del mouse en el canvas
function updateMouseCoordinates(context) {
    context.font = "bold 15px cursive";
    context.fillStyle = "white"; // Cambiar el color del texto a blanco
    context.fillText(" X: " + mouseX, 20, 10); // Actualiza el texto con la coordenada X
    context.fillText(" Y: " + mouseY, 20, 25); // Actualiza el texto con la coordenada Y
}

// Llama a la función para actualizar las coordenadas del mouse en cada frame
function drawMouseCoordinates() {
    ctx.save(); // Guarda el estado del contexto
    updateMouseCoordinates(ctx); // Actualiza las coordenadas del mouse
    ctx.restore(); // Restaura el estado del contexto
    requestAnimationFrame(drawMouseCoordinates); // Llama recursivamente a la función
}

setInterval(createCircle, 1000); // Crea un nuevo círculo cada segundo
updateCircles(); // Llama a la función para actualizar los círculos
drawMouseCoordinates(); // Llama a la función para dibujar las coordenadas del mouse
