import {Chart, LineController, UpdateMode} from "chart.js";
import {createTypedChart} from "vue-chartjs";

class PerformanceController extends LineController {
  static id = 'performance'
  static defaults = LineController.defaults

  /**
   * Custom draw function that connects a subset of dots with a line. The line is drawn between the dots whose
   * associated raw data has the parameter 'hasLine' set to true.
   */
  draw(): void {
    super.draw()
    const meta = this.getMeta();
    const ctx = this.chart.ctx

    // only draw a line if at least  two entries are available
    if (meta.data.length <= 1) return

    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = 2

    const {x, y} = meta.data[0].getProps(['x', 'y']);
    let lastY = y as number

    // move drawing cursor to first point in dataset
    ctx.moveTo(x as number, y as number)

    // connect  the line between the dots with 'hasLine' set to true
    meta.data.forEach(d => {
      const {x, y, $context} = d.getProps(['x', 'y', '$context']);
      const raw = ($context as { raw: PerformanceData }).raw

      if (raw.hasLine) {
        ctx.lineTo(x as number, y as number)
        lastY = y as number
      }
    })

    // draw the line to the right plot border
    ctx.lineTo(this.chart.chartArea.right, lastY)

    ctx.stroke()
    ctx.restore() // restore draw settings from before the call
  }

  public update(mode: UpdateMode): void {
    super.update(mode)
  }
}

Chart.register(PerformanceController)
declare module 'chart.js' {
  export interface ChartTypeRegistry {
    performance: ChartTypeRegistry['scatter']
  }
}

export interface PerformanceData {
  date: Date,
  x: number,
  y: number,
  isTraining: boolean,
  hasLine: boolean,
}

export const PerformancePlot = createTypedChart(PerformanceController.id, PerformanceController)