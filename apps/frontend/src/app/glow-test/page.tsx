export default function GlowTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-8">Glow Button Test Page</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl mb-4">Light Theme Test</h2>
          <button className="glow-button px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
            Glowing Button (Light)
          </button>
        </div>

        <div className="dark">
          <h2 className="text-xl mb-4 text-white">Dark Theme Test</h2>
          <button className="glow-button px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
            Glowing Button (Dark)
          </button>
        </div>

        <div className="night">
          <h2 className="text-xl mb-4 text-white">Night Theme Test</h2>
          <button className="glow-button px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">
            Glowing Button (Night)
          </button>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-muted-foreground">
          Test different states:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li>The button should have a subtle glow that pulses every 2.5 seconds</li>
          <li>On hover, the glow should intensify and pulse faster</li>
          <li>Each theme should use different colors: Blue (light), Light Blue (dark), Orange (night)</li>
          <li>The animation should respect prefers-reduced-motion settings</li>
        </ul>
      </div>
    </div>
  );
}