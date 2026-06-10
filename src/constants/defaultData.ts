import type { SectionType } from '../types';

export const defaultSections: Record<SectionType, any> = {
  navbar: { logoImage: '/assets/images/Rivigo By Mahindra.png', links: [] },
  hero: { 
    title1: 'Surface Express',
    title2: 'Services That Keep Your',
    title3: 'Business Moving',
    subtitle: 'Premium global supply chain management with uncompromising reliability and speed.', 
    submitButtonText: 'Submit',
    buttonText: 'Get a Free Quote', 
    backgroundImage: '/assets/images/Main_Banner_1920x1080.JPG',
    formTitle: 'Request a Call Back',
    formFields: [
      { name: 'first_name', label: 'First Name *', placeholder: 'Enter first name', type: 'text' },
      { name: 'last_name', label: 'Last Name *', placeholder: 'Enter last name', type: 'text' },
      { name: 'email', label: 'Email *', placeholder: 'Enter your email', type: 'email' },
      { name: 'company', label: 'Company *', placeholder: 'Enter company', type: 'text' },
      { name: 'city', label: 'City', placeholder: 'Enter city', type: 'text', required: false },
      { name: 'zip', label: 'Pin Code', placeholder: 'Enter pin code', type: 'text', required: false },
      { name: 'mobile', label: 'Mobile *', placeholder: 'Enter mobile', type: 'text' },
      { name: '00N4x00000bbbE3', label: 'Interested In *', placeholder: '--None--', type: 'select', options: ['Surface Express'] },
      { name: '00N4x00000bbbEM', label: 'Remarks *', placeholder: 'Enter remarks...', type: 'textarea', maxLength: 255 }
    ]
  },
  'thank-you': {
    heading: 'Connect With Us',
    title: 'Thank You!',
    message: 'Thank you for your interest! We will get in touch with you shortly.',
    buttonText: 'Back to Landing Page'
  },
  about: { 
    tagline: 'ABOUT LOGISCORE',
    title1: 'GET PREDICTABLE & TIME-',
    title2: 'DEFINITE B2B DELIVERIES',
    title3: 'ACROSS INDIA',
    text: 'Power your supply chain with our B2B surface express solutions. From part truck load (PTL) services to pan-India distribution, we deliver time-definite, dependable, and predictable logistics across India. Our surface express services are designed to bring consistency and control to your supply chain. With optimised turnaround times and technology-driven operations, we ensure your shipments move efficiently and reliably across every mile.', 
    image: '/assets/images/About_Section01_720x576.jpg',
    stats: [
      { label: 'trans-shipment hubs', value: '260+' }, 
      { label: 'first & last-mile partners', value: '400+' },
      { label: 'million sq. ft. of hub space handling', value: '1.5M' },
      { label: '1,100 line haul trucks', value: '1,100' }
    ] 
  },
  brands: { 
    title1: 'Trusted by', 
    title2: 'Leading Brands', 
    logos: [
      '/assets/images/Customer Logos/Ambrane Logo.png',
      '/assets/images/Customer Logos/D-Link Logo.png',
      '/assets/images/Customer Logos/Dollar Industries Logo.jpg',
      '/assets/images/Customer Logos/Dot and Key Logo.jpeg',
      '/assets/images/Customer Logos/Grasim Logo.jpg',
      '/assets/images/Customer Logos/Loreal India Logo.jpg',
      '/assets/images/Customer Logos/Pallavaa Logo.jpg',
      '/assets/images/Customer Logos/Plix Logo.webp',
      '/assets/images/Customer Logos/PurePlay Logo.jpg',
      '/assets/images/Customer Logos/Sugar Cosmetics Logos.png'
    ] 
  },
  footer: { 
    logo: 'MAHINDRA LOGISTICS',
    logoImage: '/assets/images/Rivigo By Mahindra.png',
    description: 'Driving excellence in logistics and supply chain solutions across the globe.',
    ctaText: 'Get a Quote',
    phone: '+91 98765 43210',
    copyright: '© 2024 Mahindra Logistics. All rights reserved.',
    links: [
      { label: 'Privacy Policy', url: '#' },
      { label: 'Terms & Conditions', url: '#' }
    ]
  },
  features: { 
    title1: 'Our Core',
    title2: 'Services',
    subtitle: 'Comprehensive logistics solutions tailored for industrial-scale operations',
    cards: [
      { 
        title: '3PL Logistics', 
        description: 'Express global delivery for time-critical industrial components with guaranteed on-time performance.',
        image: '/assets/images/IMAGE (2).png',
        link: ''
      },
      { 
        title: 'Warehousing', 
        description: 'Secure and scalable warehousing with real-time inventory control and optimized storage efficiency.',
        image: '/assets/images/IMAGE (3).png',
        link: ''
      },
      { 
        title: 'Fulfillment', 
        description: 'Fast and accurate order fulfillment ensuring timely dispatch and improved customer satisfaction.',
        image: '/assets/images/IMAGE (4).png',
        link: ''
      },
      { 
        title: 'Last-Mile Delivery', 
        description: 'Efficient last-mile delivery solutions for faster, reliable, and on-time doorstep service.',
        image: '/assets/images/IMAGE (5).png',
        link: ''
      },
      { 
        title: 'WMS Software', 
        description: 'Smart warehouse management software enabling real-time tracking, automation, and operational efficiency.',
        image: '/assets/images/IMAGE (6).png',
        link: ''
      },
      { 
        title: 'Order Management', 
        description: 'Centralized order management system for streamlined processing, tracking, and delivery execution.',
        image: '/assets/images/IMAGE (7).png',
        link: ''
      }
    ] 
  },
  industries: { 
    title1: 'Industries We',
    title2: 'Serve',
    subtitle: 'Our solutions are tailored to meet the unique logistics requirements of multiple sectors with reliability and consistency.',
    cards: [
      { title: 'Automotive & Industrial', icon: '/assets/images/Icons/Automotive & Industrial.svg' }, 
      { title: 'E-commerce & Quick Commerce', icon: '/assets/images/Icons/E-commerce.svg' }, 
      { title: 'Fashion & Retail', icon: '/assets/images/Icons/Fashion & Retail.svg' },
      { title: 'Electronics & White Goods', icon: '/assets/images/Icons/Electronics & White Goods.svg' },
      { title: 'Pharmaceutical & Chemicals', icon: '/assets/images/Icons/Pharmaceutical & Chemicals.svg' },
      { title: 'FMCG & FMCD', icon: '/assets/images/Icons/FMCG & FMCD.svg' }
    ] 
  },
  warehouses: { 
    title1: 'Nationwide Warehouse',
    title2: 'Network',
    subtitle: 'Strategically located facilities equipped with state-of-the-art technology to optimize your supply chain and reduce transit times.',
    cities: [
      { 
        name: 'Delhi', 
        address: 'PLOT 12, OKHLA PHASE III, NEW DELHI 110020',
        details: 'Our North India hub features multi-tier racking and rapid cross-docking capabilities for high-velocity distribution.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Mumbai', 
        address: 'PLOT 45, MIDC INDUSTRIAL AREA, ANDHERI EAST, MUMBAI 400093',
        details: 'Our flagship Mumbai facility offers over 100,000 sq ft of premium storage space. Positioned near major transport hubs, it ensures rapid distribution across the western corridor with 24/7 operational capabilities and advanced inventory tracking.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Bangalore', 
        address: 'SY NO. 88, WHITEFIELD MAIN ROAD, BENGALURU 560066',
        details: 'Tech-enabled fulfillment center optimized for E-commerce and electronics with precision order picking and real-time WMS integration.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Kolkata', 
        address: 'P-45, TARATALA ROAD, KOLKATA 700088',
        details: 'Eastern gateway hub providing end-to-end logistics support for regional distribution and cross-border trade operations.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Hyderabad', 
        address: 'SURVEY NO. 120, KOTHUR, HYDERABAD 509228',
        details: 'Modern facility specializing in pharmaceutical and chemical storage with temperature-controlled environments and strict safety compliance.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Ghaziabad (NCR)', 
        address: 'C-22, LONI ROAD INDUSTRIAL AREA, GHAZIABAD 201003',
        details: 'Strategic NCR hub supporting heavy industrial logistics and bulk warehousing requirements with optimized heavy-duty racking.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Sonipal (NCR)', 
        address: 'PLOT 882, HSIIDC INDUSTRIAL ESTATE, RAI, SONIPAT 131029',
        details: 'Large-scale storage facility with advanced material handling equipment and excellent connectivity to NH-44 for North India distribution.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Kundli (NCR)', 
        address: 'SECTOR 38, KUNDLI INDUSTRIAL AREA, SONIPAT 131028',
        details: 'High-tech warehousing solution featuring smart automation and flexible space options for seasonal demand spikes.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      },
      { 
        name: 'Chennai', 
        address: 'SURVEY NO. 223, ORAGADAM, CHENNAI 602105',
        details: 'Automotive-centric hub located near major OEM plants, providing JIT (Just-in-Time) delivery and specialized parts management.',
        image: '/assets/images/d2cf0cb5-122e-48a7-87f7-6f23540b452e.jpg.png'
      }
    ] 
  },
  'why-choose-us': { 
    title1: 'Why Choose', 
    title2: 'US',
    subtitle: 'We combine industrial-grade infrastructure with cutting-edge technology to deliver supply chain solutions you can trust.',
    cards: [
      {
        title: "Dependable Operations",
        icon: "/assets/images/Icons/Dependable.svg",
        isFeatured: true,
        points: [
          "Consistent service delivery",
          "Reduced DEPS (Damage, Excess, Pilferage, Shortage)",
          "Prompt customer support",
          "Optimised TAT with transparent pricing"
        ]
      },
      {
        title: "Extensive Reach",
        icon: "/assets/images/Icons/Extensive Reach.svg",
        points: [
          "19,000+ pin codes across the country",
          "260+ strategically placed hubs & DCs",
          "16+ state-of-the-art processing centres",
          "190+ regional branches & terminals"
        ]
      },
      {
        title: "Best-in-Class Technology",
        icon: "/assets/images/Icons/Best In-Class Technology.svg",
        points: [
          "End-to-end operational visibility",
          "Real-time tracking for customers",
          "Seamless and quick onboarding",
          "Automated billing and reporting"
        ]
      }
    ]
  },
  'network': {
    networkTitle: 'Our Strategic Network',
    networkSubtitle: 'We have established a robust pan-India infrastructure designed to minimize transit times and maximize efficiency. No matter where your business operates, our network connects you.',
    networkImage: '',
    regions: [
      { name: "South", details: "Andhra Pradesh, Karnataka, Tamil Nadu, Telangana", icon: '' },
      { name: "North", details: "Haryana, Delhi, Uttar Pradesh", icon: '' },
      { name: "West", details: "Gujarat, Maharashtra, Madhya Pradesh, Rajasthan", icon: '' },
      { name: "East", details: "West Bengal, Jharkhand, Assam", icon: '' }
    ]
  },
  maps: { embedCode: '', addresses: [{ name: 'HQ', text: 'Mumbai, India' }] },
  video: { videoUrl: 'https://www.youtube.com/embed/5iPU4OOEVZY', title: 'Mahindra Logistics Facility Tour', thumbnail: '/uploads/1778740597141-297611119.avif' },
  faq: {
    title1: 'Frequently Asked',
    title2: 'Questions',
    subtitle: 'Find answers to common questions about our logistics and warehousing services.',
    items: [
      { 
        question: 'What is 3PL logistics?', 
        answer: '3PL (Third-Party Logistics) refers to outsourcing logistics operations such as warehousing, transportation, and distribution to a specialized service provider for improved efficiency and scalability.' 
      },
      { 
        question: 'Which cities do you cover?', 
        answer: 'We have a pan-India presence covering over 19,000+ pin codes and all major industrial hubs including Mumbai, Delhi, Bengaluru, Chennai, and more.' 
      },
      { 
        question: 'Do you offer WMS integration?', 
        answer: 'Yes, our state-of-the-art Warehouse Management System (WMS) can seamlessly integrate with your existing ERP and e-commerce platforms for real-time visibility.' 
      },
      { 
        question: 'How is billing done?', 
        answer: 'We offer flexible billing models including activity-based, fixed plus variable, or dedicated space models depending on your specific volume and requirements.' 
      },
      { 
        question: 'What industries do you serve?', 
        answer: 'We serve a wide range of industries including Automotive, E-commerce, Consumer Goods, Pharma, and Industrial Engineering.' 
      },
      { 
        question: 'How do I get a quote?', 
        answer: 'You can request a quote by clicking the "Get a Quote" button on our portal or contacting our sales team directly through the provided channels.' 
      }
    ]
  },
  testimonials: {
    title1: 'What Our',
    title2: 'Clients Say',
    subtitle: 'Hear from our clients about their experience with our logistics and warehousing solutions.',
    items: [
      {
        name: "Rahul Sharma",
        role: "Operations Manager, Retail Company",
        feedback: "We experienced seamless logistics support with excellent warehousing facilities. Their team ensured timely deliveries and efficient handling of our inventory.",
        avatar: "/uploads/1778740066968-934425608.jpg",
        stars: 5
      },
      {
        name: "Priya Mehta",
        role: "Founder, E-commerce Brand",
        feedback: "Their nationwide network helped us scale our business operations quickly. Reliable service and great customer support throughout.",
        avatar: "/uploads/1778740075218-351562247.jpg",
        stars: 5
      },
      {
        name: "Amit Verma",
        role: "Supply Chain Head, Manufacturing Firm",
        feedback: "Highly professional team with advanced WMS technology. Our supply chain has become more efficient and transparent.",
        avatar: "/uploads/1778739908882-427565395.jpg",
        stars: 5
      }
    ]
  },
  'case-studies': {
    title1: 'Case',
    title2: 'Studies',
    readStoryText: 'Read Full Story',
    items: [
      {
        title: "Unlocked 12% Inventory Holding Cost",
        subtitle: "for a Leading Steel Manufacturer",
        icon: "TrendingUp",
        link: ""
      },
      {
        title: "Unlocked 200% Monthly Volume Growth",
        subtitle: "for a Global Manufacturer Through B2B Express Services",
        icon: "Zap",
        link: ""
      },
      {
        title: "Achieved 97% Efficiency in Pharma Distribution",
        subtitle: "with B2B Express Solutions",
        icon: "Activity",
        link: ""
      },
      {
        title: "Engineered Efficiency with 98% On-Time Delivery",
        subtitle: "Rate for a Ayurvedic Brand",
        icon: "Clock",
        link: ""
      }
    ]
  },
  custom: { 
    title: 'Custom Section', 
    blocks: [
      { type: 'heading', content: 'Design Your Section' },
      { type: 'text', content: 'Add blocks and style them to create a unique experience.' }
    ] 
  },
  'html-builder': {
    title: 'HTML Builder Section',
    elements: [
      {
        id: 'root-container',
        type: 'div',
        content: '',
        styles: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0px',
          minHeight: 'auto',
          width: '100%',
          backgroundColor: '#ffffff'
        },
        children: []
      }
    ]
  },
  'technology-operations': {
    title1: 'Technology Enabled',
    title2: 'Operations',
    items: [
      { title: 'API integration with customers', icon: '/assets/images/Icons/API integration with customers.svg' },
      { title: 'Real time E2E visibility', icon: '/assets/images/Icons/Real time E2E visibility.svg' },
      { title: 'Automated MIS', icon: '/assets/images/Icons/Automated MIS.svg' },
      { title: 'Easy customer onboarding', icon: '/assets/images/Icons/Easy customer onboarding.svg' },
      { title: 'Trip planning & Automated invoicing', icon: '/assets/images/Icons/Trip planning & Automated invoicing.svg' },
      { title: 'Shop floor management for auto stock audits & placement', icon: '/assets/images/Icons/Automated MIS.svg' }
    ]
  },
  'facility-showcase': {
    title1: 'Storage Facility',
    title2: 'Showcase',
    subtitle: 'Take a closer look at our modern warehousing infrastructure, designed for efficiency, security, and scalability.',
    videoUrl: 'https://www.youtube.com/embed/5iPU4OOEVZY',
    thumbnail: '/uploads/test_thumb.png'
  },
};
