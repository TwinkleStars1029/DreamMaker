import basic from './basic.json'
import persona from './persona.json'
import background from './background.json'
import instruction from './instruction.json'
import event from './event.json'

export type ModuleType = 'basic' | 'persona' | 'background' | 'instruction' | 'event'

export interface ModuleTemplate {
  id: string
  name: string
  title: string
  content: string
  toneHints?: string[]
}

const templates: Record<ModuleType, ModuleTemplate[]> = {
  basic: basic.templates as ModuleTemplate[],
  persona: persona.templates as ModuleTemplate[],
  background: background.templates as ModuleTemplate[],
  instruction: instruction.templates as ModuleTemplate[],
  event: event.templates as ModuleTemplate[],
}

export default templates
