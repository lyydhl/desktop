import { expect } from 'chai'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as TestUtils from 'react-dom/test-utils'

import { App } from '../../src/ui/app'
import { Dispatcher } from '../../src/lib/dispatcher'
import {
  AppStore,
  GitHubUserStore,
  CloningRepositoriesStore,
  EmojiStore,
  IssuesStore,
  SignInStore,
  RepositoriesStore,
  AccountsStore,
  PullRequestStore,
} from '../../src/lib/stores'
import { InMemoryDispatcher } from '../helpers/in-memory-dispatcher'
import {
  TestGitHubUserDatabase,
  TestStatsDatabase,
  TestIssuesDatabase,
  TestRepositoriesDatabase,
  TestPullRequestDatabase,
} from '../helpers/databases'
import { StatsStore } from '../../src/lib/stats'
import { InMemoryStore, AsyncInMemoryStore } from '../helpers/stores'
import { TestActivityMonitor } from '../helpers/test-activity-monitor'
import { RepositoryStateManager } from '../../src/lib/stores/repository-state-manager'

describe('App', () => {
  let appStore: AppStore | null = null
  let dispatcher: Dispatcher | null = null
  let statsStore: StatsStore | null = null
  let repositoryStateManager: RepositoryStateManager | null = null
  let githubUserStore: GitHubUserStore | null = null
  let issuesStore: IssuesStore | null = null

  beforeEach(async () => {
    const db = new TestGitHubUserDatabase()
    await db.reset()

    const issuesDb = new TestIssuesDatabase()
    await issuesDb.reset()

    const statsDb = new TestStatsDatabase()
    await statsDb.reset()
    statsStore = new StatsStore(statsDb, new TestActivityMonitor())

    const repositoriesDb = new TestRepositoriesDatabase()
    await repositoriesDb.reset()
    const repositoriesStore = new RepositoriesStore(repositoriesDb)

    const accountsStore = new AccountsStore(
      new InMemoryStore(),
      new AsyncInMemoryStore()
    )

    const pullRequestStore = new PullRequestStore(
      new TestPullRequestDatabase(),
      repositoriesStore
    )

    githubUserStore = new GitHubUserStore(db)
    issuesStore = new IssuesStore(issuesDb)

    repositoryStateManager = new RepositoryStateManager(githubUserStore)

    appStore = new AppStore(
      githubUserStore,
      new CloningRepositoriesStore(),
      new EmojiStore(),
      issuesStore,
      statsStore,
      new SignInStore(),
      accountsStore,
      repositoriesStore,
      pullRequestStore,
      repositoryStateManager
    )

    dispatcher = new InMemoryDispatcher(appStore, repositoryStateManager)
  })

  it('renders', async () => {
    const app = TestUtils.renderIntoDocument(
      <App
        dispatcher={dispatcher!}
        appStore={appStore!}
        repositoryStateManager={repositoryStateManager!}
        issuesStore={issuesStore!}
        gitHubUserStore={githubUserStore!}
        startTime={0}
      />
    ) as React.Component<any, any>
    // Give any promises a tick to resolve.
    await wait(0)

    const node = ReactDOM.findDOMNode(app)
    expect(node).not.to.equal(null)
  })
})

function wait(timeout: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeout)
  })
}
