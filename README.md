# Rocket Simulator

This is a simple rocket simulator that uses the CANNON.js physics engine and MQTT to control the rocket.

## Installation
  
```bash
  npm install
```

## Usage
  
```bash
    npm start
```

## MQTT Topics

- `rocket/mainEngine` - Set the main engine thrust - pub
- `rocket/tilt` - Tilt the rocket - pub
- `rocket/roll` - Roll the rocket - pub
- `rocket/reset` - Reset the rocket - pub
- `rocket/step` - Step the simulation - pub
- `rocket/state` - Get the state of the rocket - pub and sub
