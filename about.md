---
layout: default
title: "关于我们"
permalink: /about/
---

<div class="about-page">
    <div class="container">
        <header class="page-header">
            <h1>关于NewSeaCall越南投资资讯</h1>
            <p class="lead">专注越南市场的AI驱动投资分析与新闻资讯平台</p>
        </header>

        <section class="about-content">
            <div class="about-intro">
                <h2>我们的使命</h2>
                <p>NewSeaCall致力于为全球投资者提供最准确、最及时、最有价值的越南市场投资资讯。通过AI技术驱动的深度分析，我们帮助投资者把握越南经济发展机遇，做出明智的投资决策。</p>
            </div>

            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-icon">🤖</div>
                    <h3>AI驱动分析</h3>
                    <p>运用先进的人工智能技术，对海量数据进行实时分析，提供深度投资洞察。</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <h3>专业研究</h3>
                    <p>专业分析师团队，深耕越南市场多年，提供权威的市场研究报告。</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">⚡</div>
                    <h3>实时更新</h3>
                    <p>7x24小时监控越南市场动态，确保投资者第一时间获得重要信息。</p>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🔒</div>
                    <h3>数据安全</h3>
                    <p>采用企业级安全标准，保护用户数据和投资信息的安全性。</p>
                </div>
            </div>

            <div class="team-section">
                <h2>我们的团队</h2>
                <p>NewSeaCall团队由来自金融、科技、越南市场研究等领域的专家组成，拥有丰富的投资分析和技术开发经验。</p>
                
                <div class="expertise-areas">
                    <div class="expertise-item">
                        <h4>🏦 金融专业</h4>
                        <p>投资银行、基金管理、风险控制等领域的资深专家</p>
                    </div>
                    <div class="expertise-item">
                        <h4>🔬 技术研发</h4>
                        <p>AI算法、大数据分析、软件开发等技术领域的精英</p>
                    </div>
                    <div class="expertise-item">
                        <h4>🌏 本土洞察</h4>
                        <p>深度了解越南政治、经济、文化的本土化专家团队</p>
                    </div>
                </div>
            </div>

            <div class="services-section">
                <h2>我们的服务</h2>
                <div class="services-grid">
                    <div class="service-item">
                        <h3>📰 新闻资讯</h3>
                        <p>实时收集和分析越南政策、市场、行业动态，提供高质量的新闻资讯服务。</p>
                    </div>
                    <div class="service-item">
                        <h3>📈 投资分析</h3>
                        <p>基于AI技术的深度市场分析，为投资决策提供科学依据和专业建议。</p>
                    </div>
                    <div class="service-item">
                        <h3>💬 咨询服务</h3>
                        <p>一对一的专业投资咨询，帮助投资者制定个性化的投资策略。</p>
                    </div>
                    <div class="service-item">
                        <h3>📊 研究报告</h3>
                        <p>定期发布深度研究报告，覆盖越南各主要行业和投资机会。</p>
                    </div>
                </div>
            </div>

            <div class="contact-section">
                <h2>联系我们</h2>
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>邮箱</strong>
                        <p><a href="mailto:{{ site.newseacall.contact_email }}">{{ site.newseacall.contact_email }}</a></p>
                    </div>
                    <div class="contact-item">
                        <strong>主网站</strong>
                        <p><a href="{{ site.newseacall.main_site }}" target="_blank">{{ site.newseacall.main_site }}</a></p>
                    </div>
                    <div class="contact-item">
                        <strong>社交媒体</strong>
                        <p>
                            <a href="https://twitter.com/{{ site.twitter.username }}" target="_blank">Twitter</a> | 
                            <a href="{{ site.facebook.publisher }}" target="_blank">Facebook</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

<style>
.about-page {
    padding: 2rem 0;
}

.page-header {
    text-align: center;
    margin-bottom: 3rem;
}

.page-header h1 {
    font-size: 2.5rem;
    color: #1F2937;
    margin-bottom: 1rem;
}

.lead {
    font-size: 1.25rem;
    color: #6B7280;
    max-width: 600px;
    margin: 0 auto;
}

.about-content {
    max-width: 800px;
    margin: 0 auto;
}

.about-intro {
    margin-bottom: 3rem;
}

.about-intro h2 {
    color: #1F2937;
    margin-bottom: 1rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.feature-item {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.feature-item h3 {
    color: #1F2937;
    margin-bottom: 1rem;
}

.team-section,
.services-section,
.contact-section {
    margin-bottom: 3rem;
}

.expertise-areas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

.expertise-item {
    padding: 1.5rem;
    background: #F9FAFB;
    border-radius: 8px;
}

.expertise-item h4 {
    color: #1F2937;
    margin-bottom: 0.5rem;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.service-item {
    padding: 2rem;
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
}

.service-item h3 {
    color: #1F2937;
    margin-bottom: 1rem;
}

.contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.contact-item strong {
    display: block;
    color: #1F2937;
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .page-header h1 {
        font-size: 2rem;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .services-grid {
        grid-template-columns: 1fr;
    }
}
</style>