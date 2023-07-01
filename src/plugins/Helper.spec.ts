import {beforeAll, describe, expect, it} from "vitest";
import {createPinia, setActivePinia} from "pinia";
import {formatResult} from "./Helper";

const id = "someId"
const isOfficial = true

const timeDiscipline = {id, isOfficial}
const distDiscipline = {id, isOfficial, isDescending: true}

const secondsRegex = new RegExp("^[1-5]?\\d\.\\d{2}s$")
const minutesRegex = new RegExp("^[1-5]?\\d:[0-5]\\d\.\\d{2}s$")
const hourRegex = new RegExp("^\\d+:[0-5]\\d:[0-5]\\d\.\\d{2}s$")
const distanceRegex = new RegExp("^[1-9]+\\d\.\\d{2}m$")

describe("Helpers unit tests", () => {
  beforeAll(() => {
    setActivePinia(createPinia())
  })


  describe("formatResult", () => {
    it("should return the given value, if no discipline is passed", () => {
      const v = "100"
      expect(formatResult(v, undefined)).to.eq(v)
    })

    it("should be formatted as time by default, and if discipline is ascending", () => {
      const v = "10"
      expect(formatResult(v, timeDiscipline)).to.match(secondsRegex)
      expect(formatResult(v, {id, isOfficial, isDescending: false})).to.match(secondsRegex)
    })

    it("should be formatted as distance if discipline is descending", () => {
      const v = "10"
      expect(formatResult(v, distDiscipline)).to.match(distanceRegex)
    })

    it("should format seconds, minutes and hours correctly", () => {
      expect(formatResult("60.00", timeDiscipline)).to.match(minutesRegex)
      expect(formatResult(60*60 + "", timeDiscipline)).to.match(hourRegex)
      expect(formatResult("0,0000001", timeDiscipline)).to.match(secondsRegex)
    })
  })
})