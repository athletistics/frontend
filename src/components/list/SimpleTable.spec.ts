import {describe, expect, it} from "vitest";
import {mount} from "@vue/test-utils";
import SimpleTable from "./SimpleTable.vue";
import {LoadingStates} from "../../types/LoadingStates";

describe("SimpleTable", () => {
  it('should have correct amount of columns', async () => {
    const wrapper = mount(SimpleTable, {
      props: {headers: ['a', 'b']}
    })

    expect(wrapper.findAll("th")).to.have.length(2)

    await wrapper.setProps({headers: ['a', 'b', 'c']})
    expect(wrapper.findAll("th")).to.have.length(3)
  });

  it('should update the table\'s loading state', async () => {
    const wrapper = mount(SimpleTable, {
      props: {headers: ['a', 'b']}
    })
    expect(wrapper.findAll("tr")).to.have.length(1)

    await wrapper.setProps({state: LoadingStates.Loading})
    expect(wrapper.findAll("tr")).to.have.length(5)

    await wrapper.setProps({state: LoadingStates.Error})
    expect(wrapper.findAll("tr")).to.have.length(2)

    await wrapper.setProps({state: LoadingStates.Empty})
    expect(wrapper.findAll("tr")).to.have.length(2)
  })
})