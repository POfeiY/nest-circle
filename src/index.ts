import fs from 'node:fs/promises'
import { hierarchy, pack } from 'd3-hierarchy'
import { data } from './processing/data'

import { lerp } from './utils'

const amountMax = Math.max(...data.map(i => i.idx))
const RADIUS_MIN = 8
const RADIUS_MAX = 300

const members = data
  .filter(member => member.name !== undefined)
  .map(member => ({
    id: member.idx,
    radius: 0,
    position: {
      x: 0,
      y: 0,
    },
    ...member,
  }))

const root = hierarchy({ ...members[0], children: members, id: 'root' })
  .sum(d => 1 + lerp(RADIUS_MIN, RADIUS_MAX, (Math.max(0.1, d.idx || 0) / amountMax) ** 0.9))
  .sort((a, b) => (b.value || 0) - (a.value || 0))

const p = pack<typeof members[0]>()
p.size([500, 500])
p.padding(2)
const circles = p(root as any).descendants().slice(1)

for (const circle of circles) {
  const id = circle.data.id
  const member = members.find(i => i.id === id)
  if (member) {
    member.radius = circle.r
    member.position = {
      x: circle.x,
      y: circle.y,
    }
  }
}

/* eslint-disable antfu/no-top-level-await */
await fs.mkdir('src/data', { recursive: true })
await fs.writeFile('src/data/nest-circles.json', JSON.stringify(members, null, 2))
