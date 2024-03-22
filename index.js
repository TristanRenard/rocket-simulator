import CANNON from 'cannon'
import mqtt from 'mqtt'

const protocol = "mqtt"
const host = "localhost"
const port = 1883
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}`

const world = new CANNON.World()
world.gravity.set(0, 0, 0)

const rocketShape = new CANNON.Cylinder(0.5, 0.5, 3, 20)
const rocketBody = new CANNON.Body({
  mass: 100,
  position: new CANNON.Vec3(0, 0, 0),
  shape: rocketShape
})

world.addBody(rocketBody)

const setMainEngineThrust = (thrust = 10) => {
  // console.log(rocketBody.velocity.x, rocketBody.velocity.y, rocketBody.velocity.z)
  if (thrust <= 10 && rocketBody.velocity.x < 1 && rocketBody.velocity.y < 1 && rocketBody.velocity.z < 1) {
    rocketBody.applyLocalImpulse(new CANNON.Vec3(0, thrust, 0), new CANNON.Vec3(0, 0, 0))
  }
}

const tiltRocket = (thrust = 10) => {
  rocketBody.applyLocalForce(new CANNON.Vec3(thrust / 3, 0, 0), new CANNON.Vec3(0, 0, 0))
  rocketBody.applyLocalForce(new CANNON.Vec3(-thrust / 3, 0, 0), new CANNON.Vec3(0, 2, 0))
}

const rollRocket = (thrust = 10) => {
  rocketBody.applyLocalForce(new CANNON.Vec3(0, 0, -thrust / 3), new CANNON.Vec3(0, 0, 0))
  rocketBody.applyLocalForce(new CANNON.Vec3(0, 0, thrust / 3), new CANNON.Vec3(0, 2, 0))
}

let prevState = {}

const publishState = () => {
  const position = rocketBody.position
  const quaternion = rocketBody.quaternion
  const velocity = rocketBody.velocity
  const angularVelocity = rocketBody.angularVelocity
  const state = {
    position: {
      x: Math.round(position.x * 10000) / 1000,
      y: Math.round(position.y * 10000) / 1000,

      z: Math.round(position.z * 10000) / 1000
    },
    quaternion: {
      x: Math.round(quaternion.x * 100) / 100,
      y: Math.round(quaternion.y * 100) / 100,
      z: Math.round(quaternion.z * 100) / 100,
      w: Math.round(quaternion.w * 100) / 100
    },
    velocity: {
      x: Math.round(velocity.x * 10000) / 1000,
      y: Math.round(velocity.y * 10000) / 1000,
      z: Math.round(velocity.z * 10000) / 1000
    },
    agnularVelocity: {
      x: Math.round(angularVelocity.x * 10000) / 1000,
      y: Math.round(angularVelocity.y * 10000) / 1000,
      z: Math.round(angularVelocity.z * 10000) / 1000
    }
  }
  if (JSON.stringify(state) === JSON.stringify(prevState)) {
    return
  }
  prevState = state
  client.publish("rocket/state", JSON.stringify(state))
}


let count = 0
const update = () => {
  count++
  // console.log("Updating " + count + " times")
  world.step(30 / 60)
  publishState()
}

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  username: "fuse",
})

client.on("connect", () => {
  console.log("Connected")
  client.subscribe("rocket/#", (err) => {
    if (err) {
      console.error(err)
    }
  })
})

client.on("message", (topic, message) => {
  if (topic === "rocket/mainEngine") {
    setMainEngineThrust(Number(message))
  }
  if (topic === "rocket/tilt") {
    tiltRocket(Number(message))
  }
  if (topic === "rocket/roll") {
    rollRocket(Number(message))
  }
  if (topic === "rocket/reset") {
    rocketBody.position.set(0, 0, 0)
    rocketBody.velocity.set(0, 0, 0)
    rocketBody.quaternion.set(0, 0, 0, 1)
    rocketBody.angularVelocity.set(0, 0, 0)
  }

  if (topic === "rocket/step") {
    update()
  }

  if (topic === "rocket/state") {
    publishState()
  }
})

setInterval(update, 30000 / 60)