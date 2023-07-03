import {describe, it, expect} from "vitest";
import {mount} from "@vue/test-utils";
import SimpleList from "./SimpleList.vue";
import {LoadingStates} from "../../types/LoadingStates";

const loading = "[data-testid=sl-loading]"
const empty = "[data-testid=sl-empty]"
const error = "[data-testid=sl-error]"

describe("SimpleList", () => {
  it('should modify the list content according to the loading state', async () => {
    const wrapper = mount(SimpleList)

    expect(wrapper.find("li").exists()).to.be.false

    await wrapper.setProps({state: LoadingStates.Loading})
    expect(wrapper.findAll("li")).to.be.length(3)
    expect(wrapper.find(empty).exists()).to.be.false
    expect(wrapper.find(error).exists()).to.be.false

    await wrapper.setProps({state: LoadingStates.Error})
    expect(wrapper.find(empty).exists()).to.be.false
    expect(wrapper.find(error).exists()).to.be.true

    await wrapper.setProps({state: LoadingStates.Empty})
    expect(wrapper.find(empty).exists()).to.be.true
    expect(wrapper.find(error).exists()).to.be.false
  })
})