import { LogParams } from '../types/types'

const info = (...params: LogParams) => {
    if (__DEV__) {
        console.log(...params)
    }
}

const error = (...params: LogParams) => {
    if (__DEV__) {
        console.error(...params)
    }
}

module.exports = {
    info, error
}
