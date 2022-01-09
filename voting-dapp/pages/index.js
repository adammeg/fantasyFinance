/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/jsx-key */
import React, { useCallback, useEffect, useState } from 'react';
import { useContractKit } from '@celo-tools/use-contractkit';
import { ContractKitProvider } from '@celo-tools/use-contractkit';
import { VoteValue } from '@celo/contractkit/lib/wrappers/Governance'
import '@celo-tools/use-contractkit/lib/styles.css';

function GovernanceApp() {
  const { address, connect, kit, getConnectedKit } = useContractKit()
  const [proposals, setProposals] = useState([])

  const fetchProposals = useCallback(async () => {
    if (!address) {
      return
    }

    const governance = await kit.contracts.getGovernance()
    const dequeue = await governance.getDequeue()

    const fetchedProposals = await Promise.all(
      dequeue.map(async (id) => {
        const [record, voteRecord] = await Promise.all([
          governance.getProposalRecord(id),
          governance.getVoteRecord(address, id),
        ])

        return {
          id,
          ...record,
          vote: voteRecord ? voteRecord.value : undefined,
        }
      })
    )

    const filteredFetchedProposals = fetchedProposals.filter(fetchedProposal => fetchedProposal.proposal.length > 0)
    setProposals(filteredFetchedProposals)
  }, [kit, address])

  const vote = useCallback(
    async (id, value) => {
      console.log('begin vote: ', id)
      const kit = await getConnectedKit()
      const governance = await kit.contracts.getGovernance()
      const voted = await governance.vote(id, value)
      console.log('voted: ', voted)
      await (voted).sendAndWaitForReceipt()
      const afterVote = fetchProposals()
      console.log('after vote: ', afterVote)
    },
    [kit, fetchProposals]
  )
  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  return (
    <div>
      <h1>FantasyFinance Council module</h1>
      <p>{address}</p>
      <button onClick={connect}>Click here to connect your wallet</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>URL</th>
            <th>Voted</th>
          </tr>
        </thead>

        <tbody>
          {proposals.map((proposal) => (
            < tr >
              <td>{proposal.id.toString()}</td>
              <td>{proposal.passed ? 'Passed' : proposal.approved ? 'Approved' : 'Not approved'}</td>
              <td>
                <a style={{ color: 'blue', textDecoration: 'underline' }} href={proposal.metadata.descriptionURL} target="_blank">
                  Link
                </a>
              </td>
              <td>
                {proposal.vote != 'None' ? (
                  <span>{proposal.vote}</span>
                ) : (
                  <div>
                    <button onClick={() => vote(proposal.id, VoteValue.Yes)}>Yes</button>
                    <button onClick={() => vote(proposal.id, VoteValue.No)}>No</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )
    </div >
  )
}

function WrappedApp() {
  return (
    <ContractKitProvider
      dapp={{
        name: "The Council",
        description: "Voting on proposals",
        url: "https://example.com",
      }}
    >
      <GovernanceApp />
    </ContractKitProvider>
  );
}
export default WrappedApp;