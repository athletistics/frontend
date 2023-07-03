import {describe, it, expect} from "vitest";
import {mount} from "@vue/test-utils";
import SimpleTableRow from "./SimpleTableRow.vue";

describe("SimpleTableRow", () => {
  it('should have non-clickable rows by default', async () => {
    const wrapper = mount(SimpleTableRow)

    expect(wrapper.find("tr").exists()).to.be.true
    expect(wrapper.find("tr").classes()).not.to.contain("cursor-pointer")
  });

  it('should have clickable rows if required', async () => {
    const wrapper = mount(SimpleTableRow)

    await wrapper.setProps({clickable: true})
    expect(wrapper.find("tr").exists()).to.be.true
    expect(wrapper.find("tr").classes()).to.contain("cursor-pointer")
  });
})