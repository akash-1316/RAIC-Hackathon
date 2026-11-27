
import { ArrowUpRight } from 'lucide-react';
import silverJubileeImage from '../assets/silver-jubilee.jpeg';
import '../styles/SliverJubliee.css';

export default function SilverJubilee() {
  return (
    <section className="silver-jubilee-section">
      <div className="silver-jubilee-container">

        <div className="jubilee-image-wrapper">
  <img
    src={silverJubileeImage}
    alt="Raghu Engineering College Silver Jubilee - 25 Years"
    className="jubilee-image"
  />
</div>

        <div className="jubilee-content">
          <span className="jubilee-label">
            CELEBRATING 25 YEARS
          </span>

          <h2>
            25 Years of
            <span> Engineering Excellence.</span>
          </h2>

          <p>
            Celebrating 25 years of learning, innovation, achievements,
            and shaping future generations of engineers. This Silver Jubilee
            marks a legacy of excellence and a vision for tomorrow.
          </p>

          <p>
            As part of this milestone celebration, we bring together
            creativity, technology, and problem-solving through a
            25-hour hackathon in collaboration with RAIC.
          </p>

          <div className="jubilee-footer">
            <span>25 YEARS OF LEGACY</span>
            <span className="jubilee-separator">•</span>
            <span>ONE FUTURE OF INNOVATION</span>
          </div>
        </div>

      </div>
    </section>
  );
}
