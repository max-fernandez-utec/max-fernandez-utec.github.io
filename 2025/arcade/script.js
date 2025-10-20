class JoystickMenu 
{
    constructor ()
    {
        this.menuItems = document.querySelectorAll('.menu-item');
        this.contentSections = document.querySelectorAll('.content-section');
        this.statusText = document.getElementById('statusText');
        this.joystickStatus = document.querySelector('.joystick-status');
        
        this.currentIndex = 0;
        this.gamepad = null;
        this.isConnected = false;
        this.lastButtonState = {};
        
        this.init();
    }
    
    init ()
    {
        // Inicializar eventos del gamepad
        window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
        
        // Inicializar navegación por teclado como fallback
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Inicializar items del menú
        this.menuItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectItem(index);
            });
        });
        
        // Actualizar estado inicial
        this.updateStatus();
        this.checkGamepads();
        
        // Iniciar loop de verificación
        this.gamepadLoop();
    }
    
    onGamepadConnected (event)
    {
        this.gamepad = event.gamepad;
        this.isConnected = true;
        this.updateStatus();
        console.log('Joystick conectado:', this.gamepad.id);
    }
    
    onGamepadDisconnected (event)
    {
        this.gamepad = null;
        this.isConnected = false;
        this.updateStatus();
        console.log('Joystick desconectado');
    }
    
    updateStatus ()
    {
        if  (this.isConnected)
        {
            this.statusText.textContent = 'Conectado';
            this.joystickStatus.classList.add('connected');
        } 
        else 
        {
            this.statusText.textContent = 'No conectado';
            this.joystickStatus.classList.remove('connected');
        }
    }
    
    checkGamepads ()
    {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

        for  (const gamepad of gamepads)
        {
            if  (gamepad)
            {
                this.gamepad = gamepad;
                this.isConnected = true;
                this.updateStatus();
                break;
            }
        }
    }
    
    gamepadLoop ()
    {
        if  (this.gamepad)
        {
            this.handleGamepadInput();
        }
        
        requestAnimationFrame(() => this.gamepadLoop());
    }
    
    handleGamepadInput ()
    {
        const gamepad = navigator.getGamepads()[this.gamepad.index];
        if (!gamepad) return;
        
        // Navegación con D-pad o stick izquierdo
        const axes = gamepad.axes;
        
        // Umbral para detectar movimiento
        const threshold = 0.5;
        
        // Detectar movimiento en ejes (stick izquierdo o D-pad)
        if  (axes[1] < -threshold)
        { // Arriba
            this.navigate(-1);
        } 
        else if  (axes[1] > threshold)
        { // Abajo
            this.navigate(1);
        }
        
        // Botones (A, B, X, Y)
        const buttons = gamepad.buttons;
        
        // Botón A (generalmente el botón 0)
        if  (buttons[0].pressed && !this.lastButtonState[0])
        {
            this.activateCurrentItem();
        }
        
        // Botón B (generalmente el botón 1) - para volver atrás si es necesario
        if  (buttons[1].pressed && !this.lastButtonState[1])
        {
            console.log('Botón B presionado');
        }

        const bots = buttons.map((e, i) => e.pressed ? i : null)
            .filter(e => e !== null).join(', ');

        // console.log('Botones:', bots);
        
        // Guardar estado actual de botones para la siguiente verificación
        buttons.forEach((button, index) => {
            this.lastButtonState[index] = button.pressed;
        });
    }
    
    handleKeyboard (event)
    {
        switch (event.key)
        {
            case 'ArrowUp':
                event.preventDefault();
                this.navigate(-1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigate(1);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.activateCurrentItem();
                break;
        }
    }
    
    navigate (direction)
    {
        // Prevenir navegación rápida
        if (this.lastNavigateTime && Date.now () - this.lastNavigateTime < 200)
        {
            return;
        }
        
        this.lastNavigateTime = Date.now();
        
        const newIndex = this.currentIndex + direction;
        
        if  (newIndex >= 0 && newIndex < this.menuItems.length)
        {
            this.currentIndex = newIndex;
            this.updateSelection();
        }
    }
    
    updateSelection ()
    {
        // Remover clase active de todos los items
        this.menuItems.forEach(item => item.classList.remove('active'));
        
        // Añadir clase active al item actual
        this.menuItems[this.currentIndex].classList.add('active');
        
        // Scroll si es necesario para mantener el item visible
        this.menuItems[this.currentIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
    
    selectItem (index)
    {
        this.currentIndex = index;
        this.updateSelection();
        this.activateCurrentItem();
    }
    
    activateCurrentItem ()
    {
        const currentItem = this.menuItems[this.currentIndex];
        const target = currentItem.getAttribute('data-target');
        
        // Actualizar contenido
        this.contentSections.forEach(section => section.classList.remove('active'));
        const targetSection = document.querySelector(target);

        if  (targetSection)
        {
            targetSection.classList.add('active');
        }
        
        // Si es un enlace externo, navegar
        const href = currentItem.getAttribute('href');

        if (href?.toLowerCase().endsWith('html')
        || href?.startsWith('http'))
        {
            const target = currentItem.getAttribute('target');
            const nueva = window.open(href, target);

            nueva.focus();
        }

        /*
        if (href && href.startsWith ('http'))
        {
            window.location.href = href;
        }
        */
        
        console.log('Item activado:', currentItem.querySelector('.menu-text').textContent);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new JoystickMenu();
});

// Función para simular conexión de joystick (útil para testing)
function simulateJoystick ()
{
    const event = new Event('gamepadconnected');

    event.gamepad = {
        id: 'Simulated Gamepad',
        index: 0,
        buttons: [{pressed: false}, {pressed: false}, {pressed: false}, {pressed: false}],
        axes: [0, 0, 0, 0]
    };

    window.dispatchEvent(event);
}

// Para testing en desarrollo, puedes descomentar la siguiente línea:
// setTimeout(simulateJoystick, 1000);
