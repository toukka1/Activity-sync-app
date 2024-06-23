import { LogParams } from '../types/fileTypes'

const info = (...params: LogParams) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...params)
  }
}

const error = (...params: LogParams) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(...params)
  }
}

module.exports = {
  info, error
}
