import { Component } from '@angular/core';

interface TaskCard {
  id: string;
  title: string;
  status: string;
  description: string;
  tags: string[];
}

interface TimelineItem {
  phase: string;
  date: string;
  description: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  tasks: TaskCard[] = [
    {
      id: 'Task 01',
      title: 'Coming Soon',
      status: 'To be announced',
      description:
        'Challenge details will be released soon. This task will explore how GenAI can support building physics workflows.',
      tags: ['GenAI', 'Building Physics', 'Simulation']
    },
    {
      id: 'Task 02',
      title: 'Coming Soon',
      status: 'To be announced',
      description:
        'A second challenge track will focus on another dimension of AI-assisted reasoning in the built environment.',
      tags: ['Reasoning', 'Performance Analysis', 'Decision Support']
    }
  ];

  timeline: TimelineItem[] = [
    {
      phase: 'Registration',
      date: 'Coming soon',
      description: 'Participants register for the challenge.'
    },
    {
      phase: 'Task Release',
      date: 'Coming soon',
      description: 'Challenge descriptions and materials are published.'
    },
    {
      phase: 'Submission',
      date: 'Coming soon',
      description: 'Participants submit their solutions and documentation.'
    },
    {
      phase: 'Results',
      date: 'Coming soon',
      description: 'Final results and selected solutions are announced.'
    }
  ];

  evaluationItems: string[] = [
    'Technical correctness',
    'Reasoning quality',
    'Reproducibility',
    'Practical relevance',
    'Clarity of documentation'
  ];

  scrollTo(sectionId: string): void {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth' });
  }
}