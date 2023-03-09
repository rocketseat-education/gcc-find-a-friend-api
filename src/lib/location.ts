import axios from 'axios'
import { titleize } from '../utils/titleize'

interface BrasilStateProps {
  name: string
}

export async function getBrasilStates() {
  const response = await axios.get('https://brasilapi.com.br/api/ibge/uf/v1')

  return response.data as BrasilStateProps
}

interface BrasilCityProps {
  name: string
  code: string
}

export async function getBrasilCitysByState(
  UFCode: string,
): Promise<BrasilCityProps> {
  const response = await axios.get(
    `https://brasilapi.com.br/api/ibge/municipios/v1/${UFCode}`,
  )

  return response.data.map((city) => ({
    name: titleize(city.nome),
    code: city.codigo_ibge,
  }))
}

interface GeoLocationProps {
  location: {
    coordinates: {
      longitude: '-49.0629788'
      latitude: '-26.9244749'
    }
  }
}
export async function getGeoLocationByCEP(cep: string) {
  const response = await axios.get(`https://brasilapi.com.br/api/cep/v2/${cep}`)

  return response.data as GeoLocationProps
}
