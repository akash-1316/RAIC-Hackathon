
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import '../styles/TierPyramid.css';

const tierData = [
  {
    id: 'basic',
    number: '01',
    name: 'Basic',
    color: 'basic',
    description:
      'A starting point for teams demonstrating strong fundamentals and structured problem-solving.',
    details: [
      'Fundamental problem-solving',
      'Core technical implementation',
      'Working prototype development'
    ]
  },
  {
    id: 'advanced',
    number: '02',
    name: 'Advanced',
    color: 'advanced',
    description:
      'A deeper challenge for teams ready to apply technical skills and develop practical solutions.',
    details: [
      'Applied technical knowledge',
      'Feature-rich implementation',
      'Practical solution development'
    ]
  },
  {
    id: 'hard',
    number: '03',
    name: 'Hard',
    color: 'hard',
    description:
      'Complex problem-solving for teams looking for a demanding technical challenge.',
    details: [
      'Complex problem-solving',
      'Advanced technical implementation',
      'Scalable solution architecture'
    ]
  }
];

function TierPyramid({ detailed = false }) {
  return (
    <div className={`tier-pyramid-layout ${detailed ? 'tier-pyramid-detailed' : ''}`}>

      {/* LEFT DESCRIPTION */}
      <div className="tier-side tier-side-left">
        {tierData
          .filter(tier => tier.id === 'advanced')
          .map(tier => (
            <TierDescription key={tier.id} tier={tier} />
          ))}
      </div>

      {/* CENTRAL PYRAMID */}
      <div className="pyramid-container">

        <div className="pyramid-tier pyramid-basic">
          <span>{tierData[0].number}</span>
          <small>BASIC</small>
        </div>

        <div className="pyramid-tier pyramid-advanced">
          <span>{tierData[1].number}</span>
          <small>ADVANCED</small>
        </div>

        <div className="pyramid-tier pyramid-hard">
          <span>{tierData[2].number}</span>
          <small>HARD</small>
        </div>

      </div>

      {/* RIGHT DESCRIPTIONS */}
      <div className="tier-side tier-side-right">
        <TierDescription tier={tierData[0]} />
        <TierDescription tier={tierData[2]} />
      </div>

    </div>
  );
}

function TierDescription({ tier }) {
  return (
    <article className={`tier-description tier-description-${tier.color}`}>

      <span className="tier-description-number">{tier.number}</span>

      <h3>{tier.name}</h3>

      <p>{tier.description}</p>

      {tier.details && (
        <ul>
          {tier.details.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      )}

      <Link to={`/tiers#${tier.id}`} className="tier-explore">
        Explore {tier.name}
        <ArrowUpRight size={16} />
      </Link>

    </article>
  );
}

export { tierData };
export default TierPyramid;
