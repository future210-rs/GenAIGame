import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

interface SensorDataset {
  name: string;
  values: number[];
}

interface OverallTeam {
  rank: number;
  team: string;
  total: number;
  taskCount: number;
}

interface LeaderboardApiResponse {
  ok: boolean;
  updatedAt?: string;
  error?: string;
  rows: LeaderboardRow[];
}

interface TaskCard {
  id: string;
  title: string;
  type: string;
  status: string;
  problemStatement: string;
  occupiedPeriod: string;
  dataset: SensorDataset[];
  questions: string[];
  goal: string;
  brief: string[];
  rules: string[];
  deliverables: string[];
  scoring: string[];
  teaches: string[];
  submission: string;
  tags: string[];
  submitUrl: string;
}

interface NeuralNode {
  x: number;
  y: number;
}

interface LeaderboardRow {
  task: string;
  team: string;
  technicalCorrectness: number | null;
  workflowProcessLogic: number | null;
  visualsDesign: number | null;
  verificationValidation: number | null;
  clarityDocumentation: number | null;
  total: number | null;
  isComplete: boolean;
}

interface TopTeam {
  rank: number;
  task: string;
  team: string;
  total: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('trainingCanvas', { static: true })
  trainingCanvas!: ElementRef<HTMLCanvasElement>;

  private animationFrameId = 0;
  private resizeObserver?: ResizeObserver;

  tasks: TaskCard[] = [
    {
      id: 'Task 01',
      title: 'And Then There Was Light',
      type: 'Coding + Visualization',
      status: 'Open',

      problemStatement:
        'You have a 3-sensor grid in a small office. The occupied period is 08:00–16:00 over 2 weekdays, resulting in 16 occupied hours in total.',

      occupiedPeriod: '08:00–16:00 over 2 weekdays → 16 occupied hours total',

      dataset: [
        {
          name: 'Sensor A',
          values: [
            120, 180, 260, 310, 410, 520, 610, 480, 220, 190, 280, 330, 390,
            450, 510, 470,
          ],
        },
        {
          name: 'Sensor B',
          values: [
            90, 140, 210, 240, 290, 310, 360, 340, 130, 110, 200, 260, 300, 320,
            330, 310,
          ],
        },
        {
          name: 'Sensor C',
          values: [
            40, 60, 80, 110, 150, 180, 210, 190, 50, 70, 90, 120, 140, 160, 180,
            170,
          ],
        },
      ],

      questions: [
        'Compute sDA300/50%: A sensor “passes” if it has ≥300 lux for ≥50% of occupied hours. sDA is the percentage of sensors that pass.',
        'Compute ASE1000,250: Using the dataset, what percentage of sensors experience ≥1000 lux for ≥250 occupied hours? For this small dataset, this threshold is not met, requiring thoughtful interpretation.',
        'Create a floor-plan map showing which sensor points pass or fail the sDA300/50% criterion.',
      ],

      goal: 'Compute two daylight metrics and create a simple visual pass/fail floor-plan map.',

      brief: [
        'Use the simplified office sensor dataset to compute sDA300/50%.',
        'Compute ASE1000,250h.',
        'Create a floor-plan style map showing which sensor points pass or fail the sDA criterion.',
      ],

      rules: [
        'Use any method: code, spreadsheet, notebook, or simple HTML/SVG.',
        'The visualization does not need to be fancy, but it should be understandable.',
        'Focus on correct logic and clear output.',
      ],

      deliverables: [
        'Computed sDA300/50%',
        'Computed ASE1000,250h',
        'Visual map of pass/fail sensors',
        'Code or workflow used',
        '“How we did it” documentation',
      ],

      scoring: [
        'Correctness: Are the metrics computed correctly?',
        'Clarity: Is the metric calculation clear?',
        'Visual Quality: How effective is the visualization?',
        'Reproducibility: Can the logic be followed and reproduced?',
      ],

      teaches: [
        'AI as a coding assistant',
        'AI for data analysis',
        'AI for visualizing technical outcomes',
        'Translating definitions into computational logic',
      ],

      submission: 'Submit Solution & Report',

      tags: ['Daylight', 'sDA', 'ASE', 'Sensor Grid', 'Visualization'],

      submitUrl:
        'https://kuleuven-my.sharepoint.com/my?id=%2Fpersonal%2Fruibo%5Ftang%5Fkuleuven%5Fbe%2FDocuments%2FSubmissions&viewid=f70fc928%2Dee07%2D4349%2D9c41%2Dec91b4ea70e7',
    },
  ];

  leaderboardApiUrl =
    'https://script.google.com/macros/s/AKfycby89BncpRN3EoA7J2oSn4qRxNzrmo5vwRz2Dcakj31ykm24yCJqihnr1_E-koX4KwL1vg/exec';

  leaderboardRows: LeaderboardRow[] = [];

  leaderboardTasks: string[] = ['Task 01', 'Task 02'];

  leaderboardLoading = false;
  leaderboardError = '';

  showWinnerModal = false;
  confirmedWinner: TopTeam | null = null;

  private leaderboardRefreshId?: number;

  evaluationItems: string[] = [
    'Technical correctness',
    'Workflow and process logic',
    'Visuals design ',
    'Verification and validation',
    'Clarity of documentation',
  ];

  ngAfterViewInit(): void {
    this.initializeTrainingCanvas();
    this.loadLeaderboard();

    this.leaderboardRefreshId = window.setInterval(() => {
      this.loadLeaderboard();
    }, 5000);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.resizeObserver?.disconnect();

    if (this.leaderboardRefreshId) {
      clearInterval(this.leaderboardRefreshId);
    }
  }

  scrollTo(sectionId: string): void {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth' });
  }

  private initializeTrainingCanvas(): void {
    const canvas = this.trainingCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    this.resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    this.resizeObserver.observe(canvas);

    const animate = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      this.drawTrainingAnimation(ctx, rect.width, rect.height, time / 1000);
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private drawTrainingAnimation(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
  ): void {
    ctx.clearRect(0, 0, width, height);

    const layers = this.createNetworkLayers(width, height);

    this.drawWeightConnections(ctx, layers, time);
    this.drawForwardPass(ctx, layers, time);
    this.drawBackwardPass(ctx, layers, time);
    this.drawNodes(ctx, layers, time);
    // this.drawLossCurve(ctx, width, height, time);
  }

  private createNetworkLayers(width: number, height: number): NeuralNode[][] {
    const xPositions = [0.42, 0.56, 0.7, 0.84, 0.96];

    const yLayouts = [
      [0.22, 0.36, 0.52, 0.68],
      [0.18, 0.3, 0.44, 0.58, 0.72],
      [0.15, 0.27, 0.4, 0.53, 0.66, 0.78],
      [0.2, 0.34, 0.5, 0.66],
      [0.3, 0.5, 0.7],
    ];

    return xPositions.map((x, layerIndex) =>
      yLayouts[layerIndex].map((y) => ({
        x: x * width,
        y: y * height,
      })),
    );
  }

  private drawWeightConnections(
    ctx: CanvasRenderingContext2D,
    layers: NeuralNode[][],
    time: number,
  ): void {
    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
      const currentLayer = layers[layerIndex];
      const nextLayer = layers[layerIndex + 1];

      currentLayer.forEach((fromNode, fromIndex) => {
        nextLayer.forEach((toNode, toIndex) => {
          const phase = Math.sin(time * 1.6 + fromIndex * 0.7 + toIndex * 0.5);
          const alpha = 0.12 + Math.max(phase, 0) * 0.14;
          const lineWidth = 0.7 + Math.max(phase, 0) * 0.8;

          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.strokeStyle = `rgba(70, 185, 255, ${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        });
      });
    }
  }

  private drawForwardPass(
    ctx: CanvasRenderingContext2D,
    layers: NeuralNode[][],
    time: number,
  ): void {
    const cycle = 5.6;
    const progress = (time % cycle) / cycle;
    const layerCount = layers.length - 1;

    const activeLayer = Math.floor(progress * layerCount);
    const localProgress = progress * layerCount - activeLayer;

    if (activeLayer < 0 || activeLayer >= layerCount) {
      return;
    }

    const currentLayer = layers[activeLayer];
    const nextLayer = layers[activeLayer + 1];

    currentLayer.forEach((fromNode, fromIndex) => {
      nextLayer.forEach((toNode, toIndex) => {
        const offset = ((fromIndex + toIndex) % 5) * 0.045;
        const p = Math.min(Math.max(localProgress - offset, 0), 1);

        if (p <= 0 || p >= 1) {
          return;
        }

        const x = fromNode.x + (toNode.x - fromNode.x) * p;
        const y = fromNode.y + (toNode.y - fromNode.y) * p;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 18);
        gradient.addColorStop(0, 'rgba(120, 220, 255, 1)');
        gradient.addColorStop(0.45, 'rgba(70, 190, 255, 0.45)');
        gradient.addColorStop(1, 'rgba(70, 190, 255, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(230, 250, 255, 0.95)';
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  private drawBackwardPass(
    ctx: CanvasRenderingContext2D,
    layers: NeuralNode[][],
    time: number,
  ): void {
    const cycle = 6.4;
    const delayedTime = time + 2.2;
    const progress = (delayedTime % cycle) / cycle;
    const layerCount = layers.length - 1;

    const activeLayerFromRight = Math.floor(progress * layerCount);
    const activeLayer = layerCount - 1 - activeLayerFromRight;
    const localProgress = progress * layerCount - activeLayerFromRight;

    if (activeLayer < 0 || activeLayer >= layerCount) {
      return;
    }

    const currentLayer = layers[activeLayer + 1];
    const previousLayer = layers[activeLayer];

    currentLayer.forEach((fromNode, fromIndex) => {
      previousLayer.forEach((toNode, toIndex) => {
        const offset = ((fromIndex + toIndex) % 4) * 0.05;
        const p = Math.min(Math.max(localProgress - offset, 0), 1);

        if (p <= 0 || p >= 1) {
          return;
        }

        const x = fromNode.x + (toNode.x - fromNode.x) * p;
        const y = fromNode.y + (toNode.y - fromNode.y) * p;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 16);
        gradient.addColorStop(0, 'rgba(255, 190, 95, 1)');
        gradient.addColorStop(0.45, 'rgba(255, 150, 70, 0.42)');
        gradient.addColorStop(1, 'rgba(255, 150, 70, 0)');

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 235, 190, 0.92)';
        ctx.arc(x, y, 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  async loadLeaderboard(): Promise<void> {
    if (
      !this.leaderboardApiUrl ||
      this.leaderboardApiUrl.includes('你的部署ID')
    ) {
      if (this.leaderboardRows.length === 0) {
        this.leaderboardRows = this.createEmptyLeaderboardRows();
      }
      return;
    }

    try {
      this.leaderboardLoading = true;
      this.leaderboardError = '';

      const response = await fetch(
        this.addCacheBuster(this.leaderboardApiUrl),
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load leaderboard JSON: ${response.status}`);
      }

      const data = (await response.json()) as LeaderboardApiResponse;

      if (!data.ok) {
        throw new Error(data.error || 'Leaderboard API returned an error.');
      }

      if (data.rows && data.rows.length > 0) {
        this.leaderboardRows = data.rows;
      } else if (this.leaderboardRows.length === 0) {
        this.leaderboardRows = this.createEmptyLeaderboardRows();
      }
    } catch (error) {
      console.error(error);
      this.leaderboardError = 'Leaderboard data could not be loaded.';

      if (this.leaderboardRows.length === 0) {
        this.leaderboardRows = this.createEmptyLeaderboardRows();
      }
    } finally {
      this.leaderboardLoading = false;
    }
  }

  private addCacheBuster(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  private createEmptyLeaderboardRows(): LeaderboardRow[] {
    const teams = 'ABCDEFGHIJKLM'.split('');

    return teams.map((letter) => ({
      task: 'Task 01',
      team: `Team ${letter}`,
      technicalCorrectness: null,
      workflowProcessLogic: null,
      visualsDesign: null,
      verificationValidation: null,
      clarityDocumentation: null,
      total: null,
      isComplete: false,
    }));
  }

  getTopTeamsByTask(taskName: string): TopTeam[] {
    return this.leaderboardRows
      .filter(
        (row) => row.task === taskName && row.isComplete && row.total !== null,
      )
      .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
      .slice(0, 3)
      .map((row, index) => ({
        rank: index + 1,
        task: row.task,
        team: row.team,
        total: row.total ?? 0,
      }));
  }

  getLeaderboardRowsByTask(taskName: string): LeaderboardRow[] {
    return this.leaderboardRows.filter((row) => row.task === taskName);
  }

  confirmWinner(): void {
    const topTeams = this.getOverallTopTeams();

    if (topTeams.length === 0) {
      return;
    }

    this.confirmedWinner = {
      rank: topTeams[0].rank,
      task: 'Overall',
      team: topTeams[0].team,
      total: topTeams[0].total,
    };

    this.showWinnerModal = true;
  }

  closeWinnerModal(): void {
    this.showWinnerModal = false;
  }

  private drawNodes(
    ctx: CanvasRenderingContext2D,
    layers: NeuralNode[][],
    time: number,
  ): void {
    layers.forEach((layer, layerIndex) => {
      layer.forEach((node, nodeIndex) => {
        const activation =
          0.45 +
          0.55 *
            Math.max(
              0,
              Math.sin(time * 2.2 - layerIndex * 0.65 + nodeIndex * 0.4),
            );

        const radius = 3.2 + activation * 2.8;

        const glow = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          radius * 5,
        );

        glow.addColorStop(0, `rgba(255, 230, 180, ${0.8 * activation})`);
        glow.addColorStop(0.35, `rgba(80, 200, 255, ${0.35 * activation})`);
        glow.addColorStop(1, 'rgba(80, 200, 255, 0)');

        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(node.x, node.y, radius * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(245, 252, 255, ${0.78 + activation * 0.22})`;
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  getOverallTopTeams(): OverallTeam[] {
    const teamMap = new Map<
      string,
      { team: string; total: number; taskCount: number }
    >();

    this.leaderboardRows
      .filter((row) => row.isComplete && row.total !== null)
      .forEach((row) => {
        const existing = teamMap.get(row.team) ?? {
          team: row.team,
          total: 0,
          taskCount: 0,
        };

        existing.total += row.total ?? 0;
        existing.taskCount += 1;

        teamMap.set(row.team, existing);
      });

    return Array.from(teamMap.values())
      .filter((team) => team.taskCount >= 2)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((team, index) => ({
        rank: index + 1,
        team: team.team,
        total: team.total,
        taskCount: team.taskCount,
      }));
  }
}
