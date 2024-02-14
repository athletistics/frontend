import {describe, it, expect} from "vitest";
import {mount} from "@vue/test-utils";
import LoadingBtn from "./LoadingBtn.vue";
import {LoadingStates} from "../../types/LoadingStates";

const btnSelector = "[data-testid=loadingbtn-container]"
const svgSelector = "[data-testid=loadingbtn-svg]"

describe("LoadingBtn", () => {
  it("should be filled by default", () => {
    const wrapper = mount(LoadingBtn, {
      props: {}
    })

    expect(wrapper.find(btnSelector).classes()).to.contain("btn-default-filled")
  })

  it("should react to changes in the loading state", async () => {
    const wrapper = mount(LoadingBtn, {
      props: {loading: {state: NaN}}
    })

    expect(wrapper.find(svgSelector).exists()).to.be.false

    await wrapper.setProps({loading: {state: LoadingStates.Loading}})
    expect(wrapper.find(svgSelector).exists()).to.be.true
    expect(wrapper.find(btnSelector).attributes().disabled).toBeDefined()


    await wrapper.setProps({loading: {state: LoadingStates.Loaded}})
    expect(wrapper.find(svgSelector).exists()).to.be.false
    expect(wrapper.find(btnSelector).attributes().disabled).toBeUndefined()
  })

  it("should use the correct visual type", async() => {
    const wrapper = mount(LoadingBtn)

    await wrapper.setProps({full: true, outlined: false})
    expect(wrapper.find(btnSelector).classes()).to.contain("btn-default-filled", "w-full")

    await wrapper.setProps({full: true, outlined: false, visualType: "primary"})
    expect(wrapper.find(btnSelector).classes()).to.contain("btn-primary-filled", "w-full")

    await wrapper.setProps({full: true, outlined: true, visualType: "primary"})
    expect(wrapper.find(btnSelector).classes()).to.contain("btn-primary", "w-full")

    await wrapper.setProps({full: false, outlined: true, visualType: "primary"})
    expect(wrapper.find(btnSelector).classes()).to.contain("btn-primary")
    expect(wrapper.find(btnSelector).classes()).not.to.contain("w-full")

    await wrapper.setProps({full: true, outlined: false, visualType: "error"})
    expect(wrapper.find(btnSelector).classes()).to.contain("btn-error-filled", "w-full")
  })
})