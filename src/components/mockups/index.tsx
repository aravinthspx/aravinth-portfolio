import type { ComponentType } from 'react'
import { AgriDashboard, AgriInputs, AgriEstimate, AgriTimeline, AgriWeather, AgriMap } from './AgriMockups'
import { SittoMap, SittoBuilding, SittoSeats, SittoStates } from './SittoMockups'

// Keys referenced from src/content/projects.ts → screens[].mockup.
// To use a real screenshot instead, replace a screen's mockup with an <img> in CaseStudy.tsx.
export const mockups: Record<string, ComponentType<{ compact?: boolean }>> = {
  'agri-dashboard': AgriDashboard,
  'agri-inputs': AgriInputs,
  'agri-estimate': AgriEstimate,
  'agri-timeline': AgriTimeline,
  'agri-weather': AgriWeather,
  'agri-map': AgriMap,
  'sitto-map': SittoMap,
  'sitto-building': SittoBuilding,
  'sitto-seats': SittoSeats,
  'sitto-states': SittoStates,
}
