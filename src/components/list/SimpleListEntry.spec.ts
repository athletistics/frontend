import {mount} from "@vue/test-utils";
import SimpleListEntry from "./SimpleListEntry.vue";
import {describe, expect, it} from "vitest";

const linkSelector = "[data-testid=sle-link]"
const defaultSelector = "[data-testid=sle-default]"

describe("SimpleListEntry", () => {
  it("should render a simple li",() => {
    const wrapper = mount(SimpleListEntry, {props: {  }})

    expect(wrapper.find(defaultSelector).exists()).to.be.true
    expect(wrapper.find(linkSelector).exists()).to.be.false
  })
})

