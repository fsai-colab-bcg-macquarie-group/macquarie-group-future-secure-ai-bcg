'use server'

export async function getIframeUrl(name: string) {
  if (name === 'fsai-flow') {
    return process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_IFRAME_DETERMINISTIC_URL || '/not-found'
      : process.env.NEXT_PUBLIC_IFRAME_DETERMINISTIC_URL || '/not-found'
  }
  if (name === 'flow-gen') {
    return process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_IFRAME_AI_FLOWS_URL || '/not-found'
      : process.env.NEXT_PUBLIC_IFRAME_AI_FLOWS_URL || '/not-found'
  }
  if (name === 'flow-see') {
    return process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_IFRAME_FLOW_SEE_URL || '/not-found'
      : process.env.NEXT_PUBLIC_IFRAME_FLOW_SEE_URL || '/not-found'
  }
  if (name === 'flow-tell') {
    return process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_IFRAME_FLOW_TELL_URL || '/not-found'
      : process.env.NEXT_PUBLIC_IFRAME_FLOW_TELL_URL || '/not-found'
  }
  return '/not-found'
}

export async function getIframeAllow(name: string) {
  if (name === 'flow-gen') {
    return process.env.NEXT_PUBLIC_IFRAME_FLOW_GEN_ALLOW || null
  }
  if (name === 'flow-see') {
    return process.env.NEXT_PUBLIC_IFRAME_FLOW_SEE_ALLOW || null
  }
  return null
}

export async function enableFlowTell() {
  return process.env.NEXT_PUBLIC_ENABLE_FLOW_TELL && process.env.NEXT_PUBLIC_ENABLE_FLOW_TELL !== 'false'
}
