import {canManageTeam, canManageResults, canManageUsers, canManageEvents, canManageDiscipline} from "./AccessControl"
import {beforeAll, beforeEach, describe, expect, it} from "vitest";
import {createPinia, setActivePinia} from "pinia";
import {useMyUserStore} from "../stores/user";
import {useAuthStore} from "../stores/auth";

const coach = "coach"
const headCoach = "head_coach"
const athlete = "athlete"

describe("Access control unit tests", () => {
  beforeAll(() => {
    setActivePinia(createPinia())
  })

  beforeEach(() => {
    useMyUserStore().$reset()
    useAuthStore().$reset()
  })

  describe("canManageTeam", () => {
    it("should return false if the user is not logged in", () => {
      expect(canManageTeam()).to.be.false
    })

    it("should return false if the user has roles, but not the required role", () => {
      const u = useMyUserStore()

      u.roles = [athlete]
      expect(canManageTeam()).to.be.false


      u.roles = [coach]
      expect(canManageTeam()).to.be.false


      u.roles = [athlete, coach]
      expect(canManageTeam()).to.be.false
    })

    it("should return false if the user has the correct role, but has no active 2FA", () => {
      const u = useMyUserStore()
      u.roles = [headCoach]
      expect(canManageTeam()).to.be.false
    })

    it("should return true if the user has the correct role and has verified 2FA", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      u.roles = [headCoach]
      a.is2FaOk = true

      expect(canManageTeam()).to.be.true
    })
  })

  describe("canManageDiscipline", () => {
    it("should return false if the user has the wrong role and has no verified 2FA", () => {
      const u = useMyUserStore()

      u.roles = []
      expect(canManageDiscipline()).to.be.false

      u.roles = [headCoach]
      expect(canManageDiscipline()).to.be.false

      u.roles = [coach]
      expect(canManageDiscipline()).to.be.false

      u.roles = [athlete, coach, headCoach]
      expect(canManageDiscipline()).to.be.false
    })

    it("should return false if the user has verified 2FA, but is missing required role", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true

      u.roles = []
      expect(canManageDiscipline()).to.be.false

      u.roles = [athlete, headCoach]
      expect(canManageDiscipline()).to.be.false
    })

    it("should return true if the user has verified 2FA, and has the required role", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true

      u.roles = [coach]
      expect(canManageDiscipline()).to.be.true
    })
  })

  describe("canManageEvents", () => {
    it("should return false if the user has not enough permission", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true
      u.roles = [athlete, headCoach]
      expect(canManageEvents()).to.be.false
    })

    it("should return true if the user has the required role, and verified 2FA", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true
      u.roles = [coach]
      expect(canManageEvents()).to.be.true
    })
  })

  describe("canManageResults", () => {
    it("should return false if the user has not enough permission", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true
      u.roles = [athlete, headCoach]
      expect(canManageResults()).to.be.false
    })

    it("should return true if the user has the required role, and verified 2FA", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true
      u.roles = [coach]
      expect(canManageResults()).to.be.true
    })
  })

  describe("canManageUsers", () => {
    it("should return false if the user has not enough permission", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true
      u.roles = [athlete, coach]
      expect(canManageUsers()).to.be.false
    })

    it("should return true if the user has the required role, and verified 2FA", () => {
      const u = useMyUserStore()
      const a = useAuthStore()
      a.is2FaOk = true
      u.roles = [headCoach]
      expect(canManageUsers()).to.be.true
    })
  })
})