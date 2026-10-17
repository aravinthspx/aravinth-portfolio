import { Vector3 } from 'three'

// Tiny damped-spring integrators used for every playful 3D reaction:
// a = k·(target − x) − c·v. Impulses ("kicks") make objects jump, then settle.

const MAX_DT = 1 / 30

export class Spring1 {
  value: number
  vel = 0
  target: number
  k: number
  c: number
  constructor(k = 120, c = 10, initial = 0) {
    this.k = k
    this.c = c
    this.value = initial
    this.target = initial
  }
  step(dt: number) {
    const h = Math.min(dt, MAX_DT)
    this.vel += (this.k * (this.target - this.value) - this.c * this.vel) * h
    this.value += this.vel * h
    return this.value
  }
  kick(v: number) {
    this.vel += v
  }
}

export class Spring3 {
  pos = new Vector3()
  vel = new Vector3()
  target = new Vector3()
  k: number
  c: number
  constructor(k = 60, c = 8) {
    this.k = k
    this.c = c
  }
  step(dt: number) {
    const h = Math.min(dt, MAX_DT)
    this.vel.x += (this.k * (this.target.x - this.pos.x) - this.c * this.vel.x) * h
    this.vel.y += (this.k * (this.target.y - this.pos.y) - this.c * this.vel.y) * h
    this.vel.z += (this.k * (this.target.z - this.pos.z) - this.c * this.vel.z) * h
    this.pos.addScaledVector(this.vel, h)
    return this.pos
  }
  kick(x: number, y: number, z = 0) {
    this.vel.x += x
    this.vel.y += y
    this.vel.z += z
  }
}
